package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Entrada para atualização de usuário. Senha opcional — só troca se enviada. */
public record AppUserUpdateRequest(
        @NotBlank @Size(max = 150) String nome,
        @NotBlank @Pattern(regexp = "ADMIN|USER", message = "role deve ser ADMIN ou USER") String role,
        Boolean ativo,
        @Size(min = 4, max = 255) String password
) { }
