package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Entrada para criação de usuário — senha obrigatória. */
public record AppUserCreateRequest(
        @NotBlank @Size(min = 3, max = 100) String username,
        @NotBlank @Size(min = 4, max = 255) String password,
        @NotBlank @Size(max = 150) String nome,
        @NotBlank @Pattern(regexp = "ADMIN|USER", message = "role deve ser ADMIN ou USER") String role,
        Boolean ativo
) { }
