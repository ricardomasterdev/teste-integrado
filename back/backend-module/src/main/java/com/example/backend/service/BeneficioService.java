package com.example.backend.service;

import com.example.backend.domain.Beneficio;
import com.example.backend.dto.BeneficioDto;
import com.example.backend.dto.TransferRequest;
import com.example.backend.exception.BusinessException;
import com.example.backend.repository.BeneficioRepository;
import com.example.backend.repository.BeneficioTransferenciaRepository;
import com.example.backend.domain.BeneficioTransferencia;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Serviço de Benefícios — replica a lógica do {@code BeneficioEjbService} corrigido.
 *
 * Contém a operação {@link #transfer(TransferRequest)}, equivalente ao EJB, com:
 * - validações completas
 * - pessimistic locking com ordem determinística de IDs (previne deadlock)
 * - optimistic locking via @Version
 * - transação gerenciada + rollback automático em qualquer exceção
 * - auditoria de cada tentativa em {@code beneficio_transferencia}
 */
@Service
public class BeneficioService {

    private static final Logger log = LoggerFactory.getLogger(BeneficioService.class);

    private final BeneficioRepository repo;
    private final BeneficioTransferenciaRepository transfRepo;

    public BeneficioService(BeneficioRepository repo, BeneficioTransferenciaRepository transfRepo) {
        this.repo = repo;
        this.transfRepo = transfRepo;
    }

    // ------------------------- CRUD -------------------------

    @Transactional(readOnly = true)
    public Page<BeneficioDto> list(String nome, Pageable pageable) {
        Page<Beneficio> page = (nome == null || nome.isBlank())
                ? repo.findAll(pageable)
                : repo.findByNomeContainingIgnoreCase(nome.trim(), pageable);
        return page.map(BeneficioDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public BeneficioDto findById(Long id) {
        return repo.findById(id)
                .map(BeneficioDto::fromEntity)
                .orElseThrow(() -> notFound(id));
    }

    @Transactional
    public BeneficioDto create(BeneficioDto dto) {
        if (dto.valor() == null || dto.valor().signum() < 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "VALIDATION_ERROR", "Valor não pode ser negativo.");
        }
        Beneficio b = dto.toEntity();
        b.setId(null);
        b.setAtivo(dto.ativo() == null ? Boolean.TRUE : dto.ativo());
        return BeneficioDto.fromEntity(repo.save(b));
    }

    @Transactional
    public BeneficioDto update(Long id, BeneficioDto dto) {
        Beneficio b = repo.findById(id).orElseThrow(() -> notFound(id));
        b.setNome(dto.nome());
        b.setDescricao(dto.descricao());
        if (dto.valor() != null) {
            if (dto.valor().signum() < 0) {
                throw new BusinessException(HttpStatus.BAD_REQUEST,
                        "VALIDATION_ERROR", "Valor não pode ser negativo.");
            }
            b.setValor(dto.valor());
        }
        if (dto.ativo() != null) b.setAtivo(dto.ativo());
        return BeneficioDto.fromEntity(repo.save(b));
    }

    @Transactional
    public void delete(Long id) {
        Beneficio b = repo.findById(id).orElseThrow(() -> notFound(id));
        repo.delete(b);
    }

    // ------------------------- TRANSFERÊNCIA -------------------------

    /**
     * Operação crítica — reproduz a correção do bug do EJB.
     * Isolation READ_COMMITTED + pessimistic lock via repositório.
     */
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation   = Isolation.READ_COMMITTED,
            rollbackFor = Exception.class
    )
    public void transfer(TransferRequest req) {
        validarParametros(req);

        Long fromId = req.fromId();
        Long toId   = req.toId();
        BigDecimal amount = req.amount();

        // Ordem determinística para evitar deadlock
        Long firstId  = fromId < toId ? fromId : toId;
        Long secondId = fromId < toId ? toId   : fromId;

        try {
            Beneficio first  = repo.findByIdForUpdate(firstId)
                    .orElseThrow(() -> notFound(firstId));
            Beneficio second = repo.findByIdForUpdate(secondId)
                    .orElseThrow(() -> notFound(secondId));

            Beneficio from = Objects.equals(first.getId(), fromId) ? first  : second;
            Beneficio to   = Objects.equals(first.getId(), toId)   ? first  : second;

            validarEstado(from, to, amount);

            from.setValor(from.getValor().subtract(amount));
            to.setValor(to.getValor().add(amount));

            repo.save(from);
            repo.save(to);
            repo.flush();

            auditar(req, BeneficioTransferencia.Status.SUCCESS, "OK");
            log.info("Transferência {} -> {} valor={} concluída", fromId, toId, amount);
        } catch (BusinessException ex) {
            auditarFalha(req, mapStatus(ex.getCode()), ex.getMessage());
            throw ex;
        } catch (ObjectOptimisticLockingFailureException | CannotAcquireLockException ex) {
            auditarFalha(req, BeneficioTransferencia.Status.FAILED_LOCK,
                    "Conflito de concorrência: " + ex.getMostSpecificCause().getMessage());
            throw new BusinessException(HttpStatus.CONFLICT, "CONCURRENCY_CONFLICT",
                    "Conflito de concorrência; tente novamente.");
        }
    }

    // ------------------------- helpers -------------------------

    private BeneficioTransferencia.Status mapStatus(String code) {
        return switch (code) {
            case "INSUFFICIENT_FUNDS" -> BeneficioTransferencia.Status.FAILED_INSUFFICIENT;
            case "VALIDATION_ERROR"   -> BeneficioTransferencia.Status.FAILED_VALIDATION;
            default                   -> BeneficioTransferencia.Status.FAILED;
        };
    }

    private void validarParametros(TransferRequest r) {
        if (r.fromId() == null || r.toId() == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "VALIDATION_ERROR", "IDs de origem e destino são obrigatórios.");
        }
        if (Objects.equals(r.fromId(), r.toId())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "VALIDATION_ERROR", "Origem e destino não podem ser iguais.");
        }
        if (r.amount() == null || r.amount().signum() <= 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST,
                    "VALIDATION_ERROR", "Valor da transferência deve ser positivo.");
        }
    }

    private void validarEstado(Beneficio from, Beneficio to, BigDecimal amount) {
        if (Boolean.FALSE.equals(from.getAtivo()) || Boolean.FALSE.equals(to.getAtivo())) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "INACTIVE_ACCOUNT", "Benefícios de origem e destino devem estar ativos.");
        }
        if (from.getValor().compareTo(amount) < 0) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "INSUFFICIENT_FUNDS",
                    "Saldo insuficiente (disponível: " + from.getValor()
                            + ", requisitado: " + amount + ").");
        }
    }

    private BusinessException notFound(Long id) {
        return new BusinessException(HttpStatus.NOT_FOUND,
                "NOT_FOUND", "Benefício id=" + id + " não encontrado.");
    }

    private void auditar(TransferRequest r, BeneficioTransferencia.Status s, String msg) {
        BeneficioTransferencia t = new BeneficioTransferencia();
        t.setBeneficioOrigemId(r.fromId());
        t.setBeneficioDestinoId(r.toId());
        t.setValor(r.amount());
        t.setUsuario(currentUser());
        t.setStatus(s);
        t.setMensagem(msg);
        transfRepo.save(t);
    }

    /** Auditoria em transação própria para sobreviver ao rollback do negócio. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void auditarFalha(TransferRequest r, BeneficioTransferencia.Status s, String msg) {
        auditar(r, s, msg);
    }

    private String currentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            return auth != null ? auth.getName() : "anonymous";
        } catch (Exception e) {
            return "anonymous";
        }
    }
}
