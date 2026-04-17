package com.example.backend.service;

import com.example.backend.domain.AppUser;
import com.example.backend.domain.LoginLog;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.LoginResponse;
import com.example.backend.exception.BusinessException;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.LoginLogRepository;
import com.example.backend.security.JwtService;
import com.example.backend.security.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
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
    private final LoginLogRepository logRepo;
    private final JwtService jwt;

    public AuthService(AuthenticationManager authManager,
                       AppUserRepository userRepo,
                       LoginLogRepository logRepo,
                       JwtService jwt) {
        this.authManager = authManager;
        this.userRepo = userRepo;
        this.logRepo = logRepo;
        this.jwt = jwt;
    }

    public LoginResponse login(LoginRequest req, HttpServletRequest http) {
        String ip = RequestUtils.clientIp(http);
        String ua = RequestUtils.userAgent(http);

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
        } catch (AuthenticationException ex) {
            registrar(req.username(), null, ip, ua, false, "Credenciais invalidas");
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS",
                    "Usuário ou senha inválidos");
        }

        AppUser u = userRepo.findByUsername(req.username())
                .orElseThrow(() -> {
                    registrar(req.username(), null, ip, ua, false, "Usuario nao encontrado apos auth");
                    return new BusinessException(HttpStatus.UNAUTHORIZED,
                            "BAD_CREDENTIALS", "Usuário ou senha inválidos");
                });

        String token = jwt.generate(u.getUsername(), Map.of(
                "role", u.getRole(),
                "nome", u.getNome()
        ));

        registrar(u.getUsername(), u.getNome(), ip, ua, true, "Login bem sucedido");

        return new LoginResponse(token, u.getUsername(), u.getNome(), u.getRole(), jwt.getExpirationMs());
    }

    private void registrar(String username, String nome, String ip, String ua,
                           boolean sucesso, String mensagem) {
        try {
            LoginLog log = new LoginLog();
            log.setUsername(username == null ? "-" : username);
            log.setNome(nome);
            log.setIp(ip);
            log.setUserAgent(ua);
            log.setSucesso(sucesso);
            log.setMensagem(mensagem);
            logRepo.save(log);
        } catch (Exception ignored) {
            // auditoria nao pode quebrar o login
        }
    }
}
