package com.example.backend.dto;

import com.example.backend.domain.Beneficio;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BeneficioDto(
        Long id,
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 255) String descricao,
        @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal valor,
        Boolean ativo,
        Long version,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static BeneficioDto fromEntity(Beneficio b) {
        return new BeneficioDto(
                b.getId(), b.getNome(), b.getDescricao(), b.getValor(),
                b.getAtivo(), b.getVersion(), b.getCreatedAt(), b.getUpdatedAt()
        );
    }

    public Beneficio toEntity() {
        Beneficio b = new Beneficio(nome, descricao, valor);
        b.setId(id);
        b.setAtivo(ativo == null ? Boolean.TRUE : ativo);
        return b;
    }
}
