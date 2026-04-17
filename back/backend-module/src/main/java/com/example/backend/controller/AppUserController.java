package com.example.backend.controller;

import com.example.backend.dto.AppUserCreateRequest;
import com.example.backend.dto.AppUserDto;
import com.example.backend.dto.AppUserUpdateRequest;
import com.example.backend.service.AppUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Usuários", description = "CRUD de usuários do sistema")
public class AppUserController {

    private final AppUserService service;

    public AppUserController(AppUserService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Lista usuários (paginado, busca por username/nome)")
    public Page<AppUserDto> list(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return service.list(q, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca usuário por ID")
    public AppUserDto get(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    @Operation(summary = "Cria usuário")
    public ResponseEntity<AppUserDto> create(@Valid @RequestBody AppUserCreateRequest req) {
        AppUserDto saved = service.create(req);
        return ResponseEntity.created(URI.create("/api/v1/users/" + saved.id())).body(saved);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza usuário")
    public AppUserDto update(@PathVariable Long id,
                             @Valid @RequestBody AppUserUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove usuário")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String current = auth != null ? auth.getName() : null;
        service.delete(id, current);
        return ResponseEntity.noContent().build();
    }
}
