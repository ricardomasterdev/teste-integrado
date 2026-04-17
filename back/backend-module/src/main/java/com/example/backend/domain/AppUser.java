package com.example.backend.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 30)
    private String role = "USER";

    @Column(nullable = false)
    private Boolean ativo = Boolean.TRUE;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
