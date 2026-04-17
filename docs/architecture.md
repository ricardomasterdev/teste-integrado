# 🏛️ Arquitetura

## Visão geral

```
┌───────────────────────────────────────────────────────────────┐
│                     Browser (Angular 17 SPA)                  │
│  Login • Dashboard • Benefícios (CRUD + Transfer) • Auditoria │
└───────────────────────┬───────────────────────────────────────┘
                        │ HTTPS + Bearer JWT
                        ▼
┌───────────────────────────────────────────────────────────────┐
│             Spring Boot 3 Backend                             │
│                                                               │
│  ┌─────────────┐   ┌──────────────┐   ┌────────────────────┐  │
│  │ Controllers │ → │   Services   │ → │   Repositories     │  │
│  │ (REST + JWT)│   │(regra negoc) │   │ (Spring Data JPA)  │  │
│  └─────────────┘   └──────────────┘   └────────────────────┘  │
│         ▲                  ▲                     ▲            │
│         │                  │                     │            │
│    Bean Validation    Transactional          @Lock            │
│    JWT Filter         rollbackFor             PESSIMISTIC     │
│    GlobalEH           Isolation RC            @Version        │
└───────────────────────┬───────────────────────────────────────┘
                        │ JDBC (HikariCP)
                        ▼
┌───────────────────────────────────────────────────────────────┐
│   PostgreSQL 17 — database: teste_integrado                   │
│     beneficio                  (entidades de domínio)         │
│     app_user                   (autenticação BCrypt)          │
│     beneficio_transferencia    (auditoria imutável)           │
└───────────────────────────────────────────────────────────────┘
```

## Camadas e responsabilidades

| Camada | Responsabilidade | Pacote |
|--------|------------------|--------|
| Apresentação (Frontend) | SPA, experiência do usuário, estado cliente | `front/src/app/features/*` |
| Interface HTTP | Validação de entrada, mapeamento REST→serviço | `controller/` |
| Segurança | Autenticação JWT, autorização, CORS | `security/` + `config/SecurityConfig` |
| Regra de negócio | Transferência, validações, locks, rollback | `service/` |
| Persistência | Contratos JPA, queries especializadas | `repository/` |
| Domínio | Entidades JPA, enums, invariantes | `domain/` |
| Integração | Exceções globais, DTOs, OpenAPI | `exception/`, `dto/`, `config/OpenApiConfig` |

## Princípios aplicados

- **SOLID** — controllers finos (SRP), repositórios interfaces (ISP/DIP), services com dependências injetadas, extensão via DTOs não via herança.
- **DDD-lite** — entidades ricas, services como casos de uso, repositórios como agregadores de domínio.
- **Defensive programming** — validação em cada entrada pública, `Optional` em vez de null, exceções tipadas.
- **Fail-fast** — validações antes de qualquer mutação persistente.
- **Defense in depth** — pessimistic lock + optimistic lock + isolation READ_COMMITTED + `rollbackFor = Exception.class`.
- **Observabilidade** — logs estruturados com SLF4J + tabela de auditoria com status semântico.

## Fluxo da operação crítica (transferência)

```
1. Controller valida DTO (@Valid)
2. Service valida regras (ids, valor, mesma conta)
3. Service ordena ids em ordem ascendente para prevenir deadlock
4. Repository emite SELECT FOR UPDATE para cada id (lock pessimista)
5. Service valida estado pós-lock (ativo, saldo)
6. Debita origem, credita destino (BigDecimal, precisão 15,2)
7. Repository.save + flush → UPDATEs emitidos imediatamente
8. Auditoria com status SUCCESS
   Se exceção → GlobalExceptionHandler converte em ErrorResponse
              + auditoria em REQUIRES_NEW com status FAILED_*
              + rollback da transação principal
```
