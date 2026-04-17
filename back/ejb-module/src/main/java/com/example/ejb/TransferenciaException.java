package com.example.ejb;

import jakarta.ejb.ApplicationException;

/**
 * Exceção de negócio para operações de transferência.
 * {@code @ApplicationException(rollback = true)} garante que o container EJB
 * marque a transação para rollback ao propagar esta exceção.
 */
@ApplicationException(rollback = true)
public class TransferenciaException extends RuntimeException {

    public enum Motivo {
        ORIGEM_NAO_ENCONTRADA,
        DESTINO_NAO_ENCONTRADO,
        MESMA_CONTA,
        VALOR_INVALIDO,
        SALDO_INSUFICIENTE,
        BENEFICIO_INATIVO,
        CONFLITO_CONCORRENTE
    }

    private final Motivo motivo;

    public TransferenciaException(Motivo motivo, String mensagem) {
        super(mensagem);
        this.motivo = motivo;
    }

    public Motivo getMotivo() { return motivo; }
}
