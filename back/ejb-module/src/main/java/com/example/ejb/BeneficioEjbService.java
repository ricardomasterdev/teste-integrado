package com.example.ejb;

import jakarta.ejb.Stateless;
import jakarta.ejb.TransactionAttribute;
import jakarta.ejb.TransactionAttributeType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.OptimisticLockException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.PessimisticLockException;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * EJB Stateless responsável pelas operações críticas sobre Benefícios.
 *
 * <h2>Correção do bug original</h2>
 * O código original apresentava três falhas graves:
 * <ol>
 *   <li><b>Sem validações</b>: aceitava valores nulos, zero, negativos, ids iguais,
 *       benefícios inexistentes ou inativos, permitindo saldo negativo.</li>
 *   <li><b>Sem locking</b>: duas transações concorrentes podiam ler o mesmo saldo
 *       e aplicar subtrações simultâneas (lost update).</li>
 *   <li><b>Sem controle de transação/rollback</b>: em caso de falha parcial, a
 *       conta origem poderia ficar debitada sem que o destino fosse creditado.</li>
 * </ol>
 *
 * <h2>Estratégia aplicada</h2>
 * <ul>
 *   <li>{@link TransactionAttributeType#REQUIRED} — operação inteira em uma única transação.</li>
 *   <li>{@link LockModeType#PESSIMISTIC_WRITE} — lock exclusivo de linha (SELECT FOR UPDATE)
 *       para evitar lost update em alta concorrência. Travamos na ordem ascendente de id
 *       para evitar deadlocks.</li>
 *   <li>{@code @Version} na entidade — backup via optimistic locking caso o pessimistic
 *       não esteja disponível no dialeto do banco.</li>
 *   <li>{@link TransferenciaException} com {@code @ApplicationException(rollback = true)} —
 *       qualquer exceção de negócio dispara rollback automático.</li>
 * </ul>
 */
@Stateless
public class BeneficioEjbService {

    private static final Logger LOGGER = Logger.getLogger(BeneficioEjbService.class.getName());

    @PersistenceContext
    private EntityManager em;

    /**
     * Transfere {@code amount} de {@code fromId} para {@code toId} de forma atômica e segura.
     *
     * @throws TransferenciaException com motivo específico em caso de falha de negócio.
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRED)
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        validarParametros(fromId, toId, amount);

        // Travamos sempre na ordem ascendente de ID para prevenir deadlocks
        Long firstId  = fromId < toId ? fromId : toId;
        Long secondId = fromId < toId ? toId   : fromId;

        Beneficio first  = lockAndLoad(firstId);
        Beneficio second = lockAndLoad(secondId);

        Beneficio from = Objects.equals(first.getId(), fromId) ? first  : second;
        Beneficio to   = Objects.equals(first.getId(), toId)   ? first  : second;

        validarEstado(from, to, amount);

        try {
            from.setValor(from.getValor().subtract(amount));
            to.setValor(to.getValor().add(amount));

            em.merge(from);
            em.merge(to);
            em.flush(); // força emissão imediata de UPDATEs e detecção de conflito
        } catch (OptimisticLockException | PessimisticLockException e) {
            LOGGER.log(Level.WARNING,
                    "Conflito de concorrência na transferência {0}->{1}",
                    new Object[]{fromId, toId});
            throw new TransferenciaException(
                    TransferenciaException.Motivo.CONFLITO_CONCORRENTE,
                    "Conflito de concorrência ao efetuar transferência; tente novamente."
            );
        }
    }

    private Beneficio lockAndLoad(Long id) {
        Beneficio b = em.find(Beneficio.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (b == null) {
            throw new TransferenciaException(
                    TransferenciaException.Motivo.ORIGEM_NAO_ENCONTRADA,
                    "Benefício id=" + id + " não encontrado."
            );
        }
        return b;
    }

    private void validarParametros(Long fromId, Long toId, BigDecimal amount) {
        if (fromId == null || toId == null) {
            throw new TransferenciaException(
                    TransferenciaException.Motivo.VALOR_INVALIDO,
                    "IDs de origem e destino são obrigatórios."
            );
        }
        if (Objects.equals(fromId, toId)) {
            throw new TransferenciaException(
                    TransferenciaException.Motivo.MESMA_CONTA,
                    "Origem e destino não podem ser iguais."
            );
        }
        if (amount == null || amount.signum() <= 0) {
            throw new TransferenciaException(
                    TransferenciaException.Motivo.VALOR_INVALIDO,
                    "Valor da transferência deve ser positivo."
            );
        }
    }

    private void validarEstado(Beneficio from, Beneficio to, BigDecimal amount) {
        if (Boolean.FALSE.equals(from.getAtivo()) || Boolean.FALSE.equals(to.getAtivo())) {
            throw new TransferenciaException(
                    TransferenciaException.Motivo.BENEFICIO_INATIVO,
                    "Benefícios de origem e destino devem estar ativos."
            );
        }
        if (from.getValor().compareTo(amount) < 0) {
            throw new TransferenciaException(
                    TransferenciaException.Motivo.SALDO_INSUFICIENTE,
                    "Saldo insuficiente no benefício origem (disponível: "
                            + from.getValor() + ", requisitado: " + amount + ")."
            );
        }
    }
}
