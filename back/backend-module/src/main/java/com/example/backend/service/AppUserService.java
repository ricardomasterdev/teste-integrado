package com.example.backend.service;

import com.example.backend.domain.AppUser;
import com.example.backend.dto.AppUserCreateRequest;
import com.example.backend.dto.AppUserDto;
import com.example.backend.dto.AppUserUpdateRequest;
import com.example.backend.exception.BusinessException;
import com.example.backend.repository.AppUserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppUserService {

    private final AppUserRepository repo;
    private final PasswordEncoder encoder;

    public AppUserService(AppUserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public Page<AppUserDto> list(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return repo.findAll(pageable).map(AppUserDto::fromEntity);
        }
        String term = q.trim();
        return repo.findByUsernameContainingIgnoreCaseOrNomeContainingIgnoreCase(term, term, pageable)
                .map(AppUserDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public AppUserDto findById(Long id) {
        return repo.findById(id).map(AppUserDto::fromEntity)
                .orElseThrow(() -> notFound(id));
    }

    @Transactional
    public AppUserDto create(AppUserCreateRequest req) {
        if (repo.existsByUsername(req.username())) {
            throw new BusinessException(HttpStatus.CONFLICT, "USERNAME_TAKEN",
                    "Já existe um usuário com esse username.");
        }
        AppUser u = new AppUser();
        u.setUsername(req.username().trim());
        u.setNome(req.nome().trim());
        u.setRole(req.role());
        u.setAtivo(req.ativo() == null ? Boolean.TRUE : req.ativo());
        u.setPassword(encoder.encode(req.password()));
        return AppUserDto.fromEntity(repo.save(u));
    }

    @Transactional
    public AppUserDto update(Long id, AppUserUpdateRequest req) {
        AppUser u = repo.findById(id).orElseThrow(() -> notFound(id));
        u.setNome(req.nome().trim());
        u.setRole(req.role());
        if (req.ativo() != null) u.setAtivo(req.ativo());
        if (req.password() != null && !req.password().isBlank()) {
            u.setPassword(encoder.encode(req.password()));
        }
        return AppUserDto.fromEntity(repo.save(u));
    }

    @Transactional
    public void delete(Long id, String currentUsername) {
        AppUser u = repo.findById(id).orElseThrow(() -> notFound(id));
        if (u.getUsername().equalsIgnoreCase(currentUsername)) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "SELF_DELETE", "Você não pode remover o próprio usuário.");
        }
        repo.delete(u);
    }

    private BusinessException notFound(Long id) {
        return new BusinessException(HttpStatus.NOT_FOUND,
                "NOT_FOUND", "Usuário id=" + id + " não encontrado.");
    }
}
