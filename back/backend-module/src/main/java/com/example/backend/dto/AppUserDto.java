package com.example.backend.dto;

import com.example.backend.domain.AppUser;

import java.time.OffsetDateTime;

/** DTO de leitura — jamais expõe hash de senha. */
public record AppUserDto(
        Long id,
        String username,
        String nome,
        String role,
        Boolean ativo,
        OffsetDateTime createdAt
) {
    public static AppUserDto fromEntity(AppUser u) {
        return new AppUserDto(
                u.getId(), u.getUsername(), u.getNome(),
                u.getRole(), u.getAtivo(), u.getCreatedAt()
        );
    }
}
