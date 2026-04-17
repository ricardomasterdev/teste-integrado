package com.example.backend.dto;

import com.example.backend.domain.BeneficioTransferencia;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Projeção enriquecida de BeneficioTransferencia — inclui os nomes dos benefícios
 * de origem e destino, evitando N+1 no frontend.
 */
public record BeneficioTransferenciaDto(
        Long id,
        Long beneficioOrigemId,
        String beneficioOrigemNome,
        Long beneficioDestinoId,
        String beneficioDestinoNome,
        BigDecimal valor,
        String usuario,
        BeneficioTransferencia.Status status,
        String mensagem,
        OffsetDateTime createdAt
) { }
