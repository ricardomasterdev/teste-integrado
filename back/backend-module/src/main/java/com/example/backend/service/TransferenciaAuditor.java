package com.example.backend.service;

import com.example.backend.domain.BeneficioTransferencia;
import com.example.backend.dto.TransferRequest;
import com.example.backend.repository.BeneficioTransferenciaRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Auditor extraído em classe separada para que o {@code @Transactional(REQUIRES_NEW)}
 * seja efetivamente aplicado via proxy Spring AOP — self-invocation dentro do
 * mesmo bean não é interceptada.
 */
@Service
public class TransferenciaAuditor {

    private final BeneficioTransferenciaRepository repo;

    public TransferenciaAuditor(BeneficioTransferenciaRepository repo) {
        this.repo = repo;
    }

    /** Auditoria em transação NOVA — sobrevive ao rollback do negócio. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarFalha(TransferRequest r, BeneficioTransferencia.Status s, String msg) {
        salvar(r, s, msg);
    }

    /** Auditoria do caminho de sucesso, junto da transação atual. */
    @Transactional(propagation = Propagation.REQUIRED)
    public void registrarSucesso(TransferRequest r, String msg) {
        salvar(r, BeneficioTransferencia.Status.SUCCESS, msg);
    }

    private void salvar(TransferRequest r, BeneficioTransferencia.Status s, String msg) {
        BeneficioTransferencia t = new BeneficioTransferencia();
        t.setBeneficioOrigemId(r.fromId());
        t.setBeneficioDestinoId(r.toId());
        t.setValor(r.amount() != null ? r.amount() : BigDecimal.ZERO);
        t.setUsuario(currentUser());
        t.setStatus(s);
        t.setMensagem(msg);
        repo.save(t);
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
