package com.example.backend.controller;

import com.example.backend.dto.BeneficioDto;
import com.example.backend.dto.TransferRequest;
import com.example.backend.service.BeneficioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/beneficios")
@Tag(name = "Benefícios", description = "CRUD e operações sobre benefícios")
public class BeneficioController {

    private final BeneficioService service;

    public BeneficioController(BeneficioService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar benefícios (paginado)")
    public Page<BeneficioDto> list(
            @RequestParam(required = false) String nome,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return service.list(nome, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter benefício por ID")
    public BeneficioDto get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @Operation(summary = "Criar benefício")
    public ResponseEntity<BeneficioDto> create(@Valid @RequestBody BeneficioDto dto) {
        BeneficioDto saved = service.create(dto);
        return ResponseEntity.created(URI.create("/api/v1/beneficios/" + saved.id())).body(saved);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar benefício")
    public BeneficioDto update(@PathVariable Long id, @Valid @RequestBody BeneficioDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover benefício")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transferir valor entre benefícios",
               description = "Operação atômica com locking e rollback — equivalente ao EJB corrigido")
    public ResponseEntity<Void> transfer(@Valid @RequestBody TransferRequest req) {
        service.transfer(req);
        return ResponseEntity.noContent().build();
    }
}
