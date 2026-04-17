package com.example.backend.dto;

import com.example.backend.domain.LoginLog;

import java.time.OffsetDateTime;

public record LoginLogDto(
        Long id,
        String username,
        String nome,
        String ip,
        String userAgent,
        Boolean sucesso,
        String mensagem,
        OffsetDateTime createdAt
) {
    public static LoginLogDto fromEntity(LoginLog l) {
        return new LoginLogDto(
                l.getId(), l.getUsername(), l.getNome(), l.getIp(),
                l.getUserAgent(), l.getSucesso(), l.getMensagem(), l.getCreatedAt()
        );
    }
}
