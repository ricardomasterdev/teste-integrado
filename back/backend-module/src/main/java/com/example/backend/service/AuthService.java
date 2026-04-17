package com.example.backend.service;

import com.example.backend.domain.AppUser;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.exception.BusinessException;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final AppUserRepository userRepo;
    private final JwtService jwt;

    public AuthService(AuthenticationManager authManager, AppUserRepository userRepo, JwtService jwt) {
        this.authManager = authManager;
        this.userRepo = userRepo;
        this.jwt = jwt;
    }

    public LoginResponse login(LoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
        } catch (AuthenticationException ex) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS",
                    "Usuário ou senha inválidos");
        }
        AppUser u = userRepo.findByUsername(req.username())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED,
                        "BAD_CREDENTIALS", "Usuário ou senha inválidos"));

        String token = jwt.generate(u.getUsername(), Map.of(
                "role", u.getRole(),
                "nome", u.getNome()
        ));
        return new LoginResponse(token, u.getUsername(), u.getNome(), u.getRole(), jwt.getExpirationMs());
    }
}
