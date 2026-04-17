package com.example.backend.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * Registro de cada tentativa de autenticação.
 * Armazena usuário, IP, user-agent e status (sucesso/falha).
 */
@Entity
@Table(name = "login_log")
public class LoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(length = 150)
    private String nome;

    @Column(length = 64)
    private String ip;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(nullable = false)
    private Boolean sucesso;

    @Column(length = 255)
    private String mensagem;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String v) { this.username = v; }
    public String getNome() { return nome; }
    public void setNome(String v) { this.nome = v; }
    public String getIp() { return ip; }
    public void setIp(String v) { this.ip = v; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String v) { this.userAgent = v; }
    public Boolean getSucesso() { return sucesso; }
    public void setSucesso(Boolean v) { this.sucesso = v; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String v) { this.mensagem = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
