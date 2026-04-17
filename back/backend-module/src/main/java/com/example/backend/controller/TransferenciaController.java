package com.example.backend.controller;

import com.example.backend.domain.BeneficioTransferencia;
import com.example.backend.repository.BeneficioTransferenciaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transferencias")
@Tag(name = "Transferências", description = "Histórico/auditoria de transferências")
public class TransferenciaController {

    private final BeneficioTransferenciaRepository repo;

    public TransferenciaController(BeneficioTransferenciaRepository repo) { this.repo = repo; }

    @GetMapping
    @Operation(summary = "Lista as transferências realizadas (mais recentes primeiro)")
    public Page<BeneficioTransferencia> list(@PageableDefault(size = 20) Pageable pageable) {
        return repo.findAllByOrderByIdDesc(pageable);
    }
}
