package com.example.backend.controller;

import com.example.backend.domain.LoginLog;
import com.example.backend.dto.LoginLogDto;
import com.example.backend.repository.LoginLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/login-logs")
@Tag(name = "Log de Acessos", description = "Auditoria de tentativas de autenticação")
public class LoginLogController {

    private final LoginLogRepository repo;

    public LoginLogController(LoginLogRepository repo) { this.repo = repo; }

    @GetMapping
    @Operation(summary = "Lista log de acessos com filtros (paginado)")
    public Page<LoginLogDto> list(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) Boolean sucesso,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {

        boolean hasUser   = username != null && !username.isBlank();
        boolean hasStatus = sucesso != null;
        String  term      = hasUser ? username.trim() : "";

        Page<LoginLog> page;
        if (hasUser && hasStatus) {
            page = repo.findByUsernameContainingIgnoreCaseAndSucesso(term, sucesso, pageable);
        } else if (hasUser) {
            page = repo.findByUsernameContainingIgnoreCase(term, pageable);
        } else if (hasStatus) {
            page = repo.findBySucesso(sucesso, pageable);
        } else {
            page = repo.findAll(pageable);
        }
        return page.map(LoginLogDto::fromEntity);
    }
}
