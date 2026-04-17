package com.example.backend.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "beneficio_transferencia")
public class BeneficioTransferencia {

    public enum Status { SUCCESS, FAILED_INSUFFICIENT, FAILED_LOCK, FAILED, FAILED_VALIDATION }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "beneficio_origem_id")
    private Long beneficioOrigemId;

    @Column(name = "beneficio_destino_id")
    private Long beneficioDestinoId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @Column(length = 100)
    private String usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status;

    @Column(length = 500)
    private String mensagem;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Long getId() { return id; }
    public Long getBeneficioOrigemId() { return beneficioOrigemId; }
    public void setBeneficioOrigemId(Long v) { this.beneficioOrigemId = v; }
    public Long getBeneficioDestinoId() { return beneficioDestinoId; }
    public void setBeneficioDestinoId(Long v) { this.beneficioDestinoId = v; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal v) { this.valor = v; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String v) { this.usuario = v; }
    public Status getStatus() { return status; }
    public void setStatus(Status v) { this.status = v; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String v) { this.mensagem = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
