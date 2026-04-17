package com.example.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record TransferRequest(
        @NotNull Long fromId,
        @NotNull Long toId,
        @NotNull @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero") BigDecimal amount
) { }
