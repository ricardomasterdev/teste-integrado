# 🏗️ Desafio Fullstack Integrado — Solução Completa

> **Autor:** Ricardo Master Dev · **Repositório:** [ricardomasterdev/teste-integrado](https://github.com/ricardomasterdev/teste-integrado) · **Ambiente:** [dev1.cdxsistemas.com.br/teste-integrado](https://dev1.cdxsistemas.com.br/teste-integrado)

Solução fullstack em camadas entregue em resposta ao desafio técnico, contemplando:

- **DB** — PostgreSQL 17 com schema + seed
- **EJB (Jakarta EE)** — serviço `BeneficioEjbService` com o bug de transferência **corrigido** (validações, rollback e pessimistic locking)
- **Backend (Spring Boot 3)** — API REST com JPA, segurança JWT, Swagger e testes automatizados
- **Frontend (Angular 17 + Material)** — SPA profissional com login, CRUD, transferência, auditoria e dashboard

---

## 📑 Índice

1. [Estrutura do repositório](#-estrutura-do-repositório)
2. [Stack tecnológica](#-stack-tecnológica)
3. [Arquitetura](#-arquitetura-em-camadas)
4. [Bug do EJB — análise e correção](#-bug-do-ejb--análise-e-correção)
5. [API REST](#-api-rest)
6. [Como rodar localmente](#-como-rodar-localmente)
7. [Banco de dados](#-banco-de-dados)
8. [Segurança / Autenticação](#-segurança--autenticação-jwt)
9. [Testes](#-testes)
10. [Deploy em dev1 (IIS + PostgreSQL)](#-deploy-em-dev1cdxsistemascombrteste-integrado)
11. [CI/CD](#-cicd)
12. [Critérios de avaliação](#-mapeamento-com-os-critérios-de-avaliação)

---

## 📦 Estrutura do repositório

Organização profissional com separação clara **back / front**:

```
teste-integrado/
├── README.md                           ← este arquivo
├── docs/                               ← documentação complementar
│   ├── bug-analysis.md                 ← análise detalhada do bug
│   └── architecture.md                 ← diagrama de camadas
├── .github/workflows/
│   └── ci.yml                          ← pipeline CI (Maven + Node)
├── back/
│   ├── db/
│   │   ├── schema.sql                  ← DDL PostgreSQL (tabelas, índices, triggers)
│   │   └── seed.sql                    ← dados iniciais (benefícios + usuários)
│   ├── ejb-module/                     ← Jakarta EE 10 (artefato de avaliação)
│   │   ├── pom.xml
│   │   └── src/main/java/com/example/ejb/
│   │       ├── Beneficio.java
│   │       ├── BeneficioEjbService.java     ← BUG CORRIGIDO aqui
│   │       └── TransferenciaException.java
│   └── backend-module/                 ← Spring Boot 3 (runtime em dev1)
│       ├── pom.xml
│       └── src/main/java/com/example/backend/
│           ├── BackendApplication.java
│           ├── config/                 (SecurityConfig, OpenApiConfig)
│           ├── controller/             (AuthController, BeneficioController, TransferenciaController)
│           ├── domain/                 (Beneficio, AppUser, BeneficioTransferencia)
│           ├── dto/                    (BeneficioDto, TransferRequest, LoginRequest/Response, ErrorResponse)
│           ├── exception/              (BusinessException, GlobalExceptionHandler)
│           ├── repository/             (Spring Data + lock pessimista)
│           ├── security/               (JwtService, JwtAuthenticationFilter, CustomUserDetailsService)
│           └── service/                (BeneficioService, AuthService)
└── front/                              ← Angular 17 (standalone components)
    ├── package.json / angular.json / tsconfig*.json
    └── src/
        ├── index.html, main.ts, styles.scss
        ├── environments/               (environment.ts / environment.prod.ts)
        └── app/
            ├── app.component.ts, app.config.ts, app.routes.ts
            ├── core/
            │   ├── guards/             (authGuard, loginGuard)
            │   ├── interceptors/       (authInterceptor — injeta JWT + tratamento global de erros)
            │   ├── models/             (tipagem)
            │   └── services/           (AuthService, BeneficioService)
            └── features/
                ├── login/              (página de login profissional)
                ├── layout/             (sidenav + toolbar persistentes)
                ├── dashboard/          (KPIs + rankings + últimas operações)
                ├── beneficios/         (lista paginada, CRUD, diálogos, transferência)
                └── transferencias/     (auditoria de transferências)
```

---

## 🧰 Stack tecnológica

| Camada | Tecnologias |
|--------|-------------|
| **Banco** | PostgreSQL 17 · H2 (dev/test) |
| **EJB** | Jakarta EE 10 · EJB 4.0 · JPA · JUnit 5 · Mockito |
| **Backend** | Java 17 · Spring Boot 3.2 · Spring Data JPA · Spring Security 6 · Hibernate 6 · jjwt 0.12 · springdoc-openapi 2.5 · Bean Validation · Maven |
| **Frontend** | Angular 17 · Angular Material 17 · TypeScript 5.4 · RxJS · Reactive Forms · Signals |
| **DevOps** | GitHub Actions · IIS (reverse proxy) · Windows Service wrapper |

---

## 🏛️ Arquitetura em camadas

```
┌────────────────────────────────────────────────────────────┐
│   Angular 17 (SPA)          → / (IIS static files)          │
│   Login • Dashboard • CRUD • Transfer • Audit              │
└───────────┬────────────────────────────────────────────────┘
            │ HTTPS + Bearer JWT
            ▼
┌────────────────────────────────────────────────────────────┐
│   IIS Reverse Proxy         → /teste-integrado              │
│     ├─ /api/*              proxy → backend:8090             │
│     └─ /**                 serve  dist/ (Angular)           │
└───────────┬────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────┐
│   Spring Boot 3 Backend                                     │
│   Controllers  →  Services (regra de negócio)               │
│       │              │                                      │
│       │              ├─ BeneficioService  (≡ EJB corrigido) │
│       │              └─ AuthService (JWT)                   │
│       │                                                     │
│   Exception Handler • Security Filter • OpenAPI • Validation│
└───────────┬────────────────────────────────────────────────┘
            │ JPA / Hibernate
            ▼
┌────────────────────────────────────────────────────────────┐
│   PostgreSQL 17                                             │
│   beneficio · app_user · beneficio_transferencia (auditoria)│
└────────────────────────────────────────────────────────────┘
```

**Princípios aplicados:**

- **SOLID**: controllers finos, services com responsabilidade única, repositórios especializados, DTOs para isolar o contrato REST do domínio JPA.
- **Separation of Concerns**: segurança (filtros), persistência (repositórios), regra (services) e apresentação (controllers) em camadas distintas.
- **Imutabilidade**: DTOs como `record`.
- **Fail-fast**: validações de entrada com Bean Validation (`@Valid`) nos controllers.
- **Defense in depth**: optimistic lock (`@Version`) + pessimistic lock (`PESSIMISTIC_WRITE`) + transação com `rollbackFor = Exception.class`.

---

## 🐞 Bug do EJB — análise e correção

### Código original

```java
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    Beneficio from = em.find(Beneficio.class, fromId);
    Beneficio to   = em.find(Beneficio.class, toId);
    // BUG: sem validações, sem locking, pode gerar saldo negativo e lost update
    from.setValor(from.getValor().subtract(amount));
    to.setValor(to.getValor().add(amount));
    em.merge(from);
    em.merge(to);
}
```

### Problemas identificados

| # | Problema | Impacto |
|---|----------|---------|
| 1 | Nenhuma validação de entrada (`null`, mesmo ID, valor ≤ 0) | NPE; transferências sem sentido |
| 2 | Sem checagem de saldo | **Saldo negativo** em produção |
| 3 | `em.find` sem `LockModeType` | **Lost update** em concorrência |
| 4 | Sem controle explícito de rollback | Débito sem crédito correspondente |
| 5 | Sem verificação de benefício ativo | Operação em conta inválida |
| 6 | Ordem de lock aleatória | Risco de **deadlock** (A→B + B→A simultâneos) |

### Correção aplicada

Arquivo: [`back/ejb-module/src/main/java/com/example/ejb/BeneficioEjbService.java`](back/ejb-module/src/main/java/com/example/ejb/BeneficioEjbService.java)

- `@TransactionAttribute(REQUIRED)` envolve **toda** a operação.
- `LockModeType.PESSIMISTIC_WRITE` em cada `em.find` → `SELECT ... FOR UPDATE`.
- **Ordem ascendente de ID** ao travar → previne deadlock determinístico.
- `@Version` na entidade (optimistic) → defesa em profundidade.
- `TransferenciaException` marcada com `@ApplicationException(rollback = true)` → rollback automático.
- `validarParametros` e `validarEstado` isolam as regras; `Motivo` enum documenta todas as falhas possíveis.
- Captura explícita de `OptimisticLockException` / `PessimisticLockException` com mensagem amigável.

> A **mesma lógica** está re-implementada no `BeneficioService` do Spring Boot (runtime em dev1). Isso garante que o comportamento da produção seja idêntico ao EJB corrigido.

---

## 🔌 API REST

Base path: `/teste-integrado/api` · Swagger UI: `/teste-integrado/api/swagger-ui.html`

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/v1/auth/login` | ❌ | Autentica e retorna JWT |
| `GET` | `/api/v1/beneficios` | ✅ | Lista paginada (params: `nome`, `page`, `size`, `sort`) |
| `GET` | `/api/v1/beneficios/{id}` | ✅ | Obter por ID |
| `POST` | `/api/v1/beneficios` | ✅ | Criar |
| `PUT` | `/api/v1/beneficios/{id}` | ✅ | Atualizar |
| `DELETE` | `/api/v1/beneficios/{id}` | ✅ | Remover |
| `POST` | `/api/v1/beneficios/transfer` | ✅ | **Transferência atômica** (equivale ao EJB) |
| `GET` | `/api/v1/transferencias` | ✅ | Histórico/auditoria |
| `GET` | `/actuator/health` | ❌ | Liveness/readiness |

### Exemplo — transferência

```bash
TOKEN=$(curl -sX POST http://localhost:8090/teste-integrado/api/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"teste","password":"123456"}' | jq -r .token)

curl -X POST http://localhost:8090/teste-integrado/api/api/v1/beneficios/transfer \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"fromId":1,"toId":2,"amount":250.00}'
# 204 No Content
```

### Resposta de erro padronizada

Todos os erros retornam um payload uniforme (`ErrorResponse`):

```json
{
  "timestamp": "2026-04-17T15:46:15Z",
  "status": 422,
  "error": "Unprocessable Entity",
  "code": "INSUFFICIENT_FUNDS",
  "message": "Saldo insuficiente (disponível: 9750.00, requisitado: 99999999).",
  "path": "/teste-integrado/api/api/v1/beneficios/transfer",
  "details": null
}
```

### Códigos de negócio

| Code | HTTP | Significado |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Input inválido (campos obrigatórios, mesmo ID, valor ≤ 0) |
| `BAD_CREDENTIALS` | 401 | Login inválido |
| `NOT_FOUND` | 404 | Benefício inexistente |
| `CONCURRENCY_CONFLICT` | 409 | Lock ou optimistic falhou |
| `INSUFFICIENT_FUNDS` | 422 | Saldo insuficiente |
| `INACTIVE_ACCOUNT` | 422 | Benefício inativo na operação |
| `INTERNAL_ERROR` | 500 | Erro inesperado |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- **Java 17** (Temurin recomendado)
- **Maven 3.9+**
- **Node.js 20+** e **npm 10+**
- **PostgreSQL 17** (para profile `prod`) — ou apenas H2 embarcado (profile `dev`)

### 1) Banco (opcional — só se for usar PostgreSQL)

```bash
psql -U postgres -c "CREATE DATABASE teste_integrado;"
psql -U postgres -d teste_integrado -f back/db/schema.sql
psql -U postgres -d teste_integrado -f back/db/seed.sql
```

### 2) Backend

```bash
cd back/backend-module

# Dev (H2 in-memory, console em /h2-console)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Prod (PostgreSQL)
mvn -DskipTests package
java -jar target/backend.jar --spring.profiles.active=prod
```

API fica em `http://localhost:8090/teste-integrado/api` · Swagger em `.../swagger-ui.html`.

### 3) Frontend

```bash
cd front
npm install
npm start                 # serve em http://localhost:4200
# ou
npm run build:prod        # gera dist/ pronto para IIS
```

---

## 🗄️ Banco de dados

Scripts em `back/db/`:

### `schema.sql`
- `beneficio` — tabela principal (id, nome, descricao, valor, ativo, version, timestamps).
- `app_user` — usuários JWT (username único, hash BCrypt, role).
- `beneficio_transferencia` — **auditoria** de cada tentativa (status: SUCCESS, FAILED_INSUFFICIENT, FAILED_LOCK, FAILED_VALIDATION, FAILED).
- Índices para busca e ordenação.
- Trigger `touch_updated_at` mantém `updated_at` sempre atualizado.

### `seed.sql`
- 7 benefícios de exemplo (inclui ativo e inativo para testar regras).
- Usuários: `teste / 123456` e `admin / 123456` — hash BCrypt cost 10.

### Credenciais de produção (dev1)

```
Host:     177.53.148.179
Porta:    5432
Database: teste_integrado
Usuário:  codex
Senha:    Ric@7901
```

> Credenciais reutilizadas do banco PostgreSQL existente do ambiente CDX.

---

## 🔐 Segurança / Autenticação JWT

- **Stateless**: sem sessões HTTP, token JWT em `Authorization: Bearer <token>`.
- **Algoritmo**: HS256 com secret de 32 bytes (`APP_JWT_SECRET`).
- **Expiração**: 8h por padrão (`APP_JWT_EXPIRATION_MS`).
- **Claims**: `sub` (username), `role`, `nome`, `iss`, `iat`, `exp`.
- **Hashing**: senhas armazenadas como BCrypt cost 10.
- **Filtro**: `JwtAuthenticationFilter` (antes do `UsernamePasswordAuthenticationFilter`).
- **Rotas abertas**: `/api/v1/auth/**`, `/actuator/**`, `/swagger-ui/**`, `/v3/api-docs/**`.
- **CORS**: configurado globalmente (`CorsFilter`) para aceitar o domínio do frontend.

### No frontend

- `AuthService` — armazena `LoginResponse` em `localStorage` e expõe signals reativos (`isAuthenticated`, `user`).
- `authInterceptor` — injeta o header `Authorization` em todas as chamadas e trata 401/403 (logout automático + snackbar).
- Guards: `authGuard` protege rotas internas, `loginGuard` impede usuários logados de verem `/login`.

---

## 🧪 Testes

### EJB (Mockito, 6 testes)
`back/ejb-module/src/test/java/com/example/ejb/BeneficioEjbServiceTest.java`

- `transfer_deveDebitarECreditarComSucesso`
- `transfer_deveFalharComSaldoInsuficiente`
- `transfer_deveFalharComValorZeroOuNegativo`
- `transfer_deveFalharMesmaConta`
- `transfer_deveFalharQuandoOrigemNaoExiste`
- `transfer_deveFalharSeBeneficioInativo`

### Backend (Spring Boot, 13 testes — 8 unitários + 5 integração)
`back/backend-module/src/test/java/com/example/backend/`

Unitários (Mockito): todos os cenários do service (sucesso, saldo, valor inválido, mesma conta, inativo, origem inexistente, create com valor negativo, create sucesso).

Integração (`@SpringBootTest` + MockMvc, profile `test` com H2 pré-populado):
- Login com credenciais inválidas retorna 401
- Listagem sem token retorna 4xx (403)
- Listagem com token válido retorna 200 + array
- Transferência 1→2 de R$100 retorna 204
- Transferência com mesma conta retorna 400

Rodar tudo:
```bash
mvn -f back/ejb-module test
mvn -f back/backend-module test
# → 19 testes, 0 falhas
```

### Frontend

Build production é a primeira barreira (strict TypeScript + strict Angular Templates). Para testes Karma adicionais:
```bash
cd front && npm test
```

---

## 🌐 Deploy em dev1.cdxsistemas.com.br/teste-integrado

O servidor `dev1` roda **Windows Server 2022 + IIS 10** e é gerenciado via RDP. A publicação segue três passos:

### 1) Backend (Windows Service)

```powershell
# 1. Copiar o JAR
copy target\backend.jar C:\apps\teste-integrado\backend.jar

# 2. Variáveis de ambiente (System Properties → Environment Variables)
APP_JWT_SECRET         = "<32+ caracteres>"
APP_JWT_EXPIRATION_MS  = 28800000
DB_HOST                = 177.53.148.179
DB_NAME                = teste_integrado
DB_USER                = codex
DB_PASSWORD            = Ric@7901
SERVER_PORT            = 8090
SPRING_PROFILES_ACTIVE = prod

# 3. Instalar como serviço com NSSM
nssm install TesteIntegradoBackend "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot\bin\javaw.exe"
nssm set TesteIntegradoBackend AppParameters "-jar C:\apps\teste-integrado\backend.jar"
nssm set TesteIntegradoBackend AppDirectory  "C:\apps\teste-integrado"
nssm set TesteIntegradoBackend Start          SERVICE_AUTO_START
nssm start TesteIntegradoBackend
```

### 2) Frontend (arquivos estáticos)

```powershell
# Gerar e copiar
cd front && npm run build:prod
xcopy /E /Y dist\* C:\inetpub\wwwroot\teste-integrado\
```

### 3) IIS — URL Rewrite

Criar aplicação `teste-integrado` sob o Site padrão e adicionar `web.config`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Proxy API" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:8090/teste-integrado/api/{R:1}" />
          <serverVariables>
            <set name="HTTP_X_FORWARDED_PROTO" value="https" />
          </serverVariables>
        </rule>
        <rule name="Angular SPA fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/teste-integrado/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json" />
    </staticContent>
  </system.webServer>
</configuration>
```

Pré-requisitos do IIS:
- `URL Rewrite 2.1` (instalado via Web Platform Installer)
- `Application Request Routing 3.0` (ARR) + habilitar **"Enable proxy"** em Server Farms → ARR cache → Server Proxy Settings

Resultado: `https://dev1.cdxsistemas.com.br/teste-integrado/` → Angular + `/teste-integrado/api/*` → backend Spring Boot.

---

## 🤖 CI/CD

`.github/workflows/ci.yml` roda em todo push/PR nas branches `main`/`develop`:

1. **backend**: JDK 17 Temurin + cache Maven → `mvn test package` (EJB e backend) → upload do JAR como artifact.
2. **frontend**: Node 20 + cache npm → `npm ci` → `npm run build:prod` → upload do `dist/`.

Artifacts ficam disponíveis por 7 dias para download manual e podem ser encadeados com um job de deploy (não incluído — dev1 requer RDP).

---

## ✅ Como a solução atende cada critério do desafio

### Arquitetura em camadas
O projeto separa de forma explícita as responsabilidades nos pacotes do backend:

- `domain/` — entidades JPA puras (`Beneficio`, `AppUser`, `BeneficioTransferencia`).
- `repository/` — contratos Spring Data com lock pessimista específico (`findByIdForUpdate`).
- `service/` — regra de negócio (`BeneficioService`, `AuthService`). Nenhuma dependência direta de HTTP ou JPA de infraestrutura.
- `controller/` — somente orquestração de request/response e validação de entrada.
- `dto/` — **records imutáveis** que isolam o contrato REST do modelo JPA.
- `security/` — `JwtService`, filtro e `UserDetailsService` em camada independente.
- `exception/` — erro centralizado em `GlobalExceptionHandler` retornando `ErrorResponse` padronizado.
- `config/` — beans transversais (segurança, OpenAPI, CORS).

Princípios SOLID aplicados: controllers finos, services com responsabilidade única, repositórios especializados, abstrações injetadas por construtor, DTOs no lugar de expor entidade. O EJB segue a mesma filosofia no `ejb-module/`, entregue como artefato Jakarta EE 10 independente.

### Correção do bug do EJB
O arquivo [`back/ejb-module/src/main/java/com/example/ejb/BeneficioEjbService.java`](back/ejb-module/src/main/java/com/example/ejb/BeneficioEjbService.java) foi reescrito endereçando **todos os defeitos** do código original:

- **Validações de entrada** centralizadas em `validarParametros`: nulos, mesmo id, valor ≤ 0.
- **Validações de estado** em `validarEstado`: saldo insuficiente e benefício inativo, antes de qualquer mutação.
- **Pessimistic locking** com `LockModeType.PESSIMISTIC_WRITE` em cada `em.find` → gera `SELECT ... FOR UPDATE`, eliminando o **lost update** do código original.
- **Optimistic locking** via `@Version` na entidade — defesa em profundidade para casos em que o dialeto do banco limite o pessimistic lock.
- **Ordem determinística** de aquisição de locks pelo id ascendente, prevenindo deadlock quando transferências opostas (A→B e B→A) rodam em paralelo.
- **Transação e rollback automático** com `@TransactionAttribute(REQUIRED)` + exceção marcada com `@ApplicationException(rollback = true)`. Captura explícita de `OptimisticLockException`/`PessimisticLockException` com mensagem amigável.
- **Motivos tipados** no `TransferenciaException.Motivo` — cada falha possível tem um código rastreável.

A mesma lógica foi replicada no `BeneficioService` do Spring Boot (runtime real em dev1) para que o comportamento do ambiente publicado seja idêntico ao EJB corrigido.

### CRUD de Benefícios e Transferência
CRUD completo com paginação, ordenação e busca por nome:

- Endpoints expostos em `BeneficioController` (`GET /api/v1/beneficios`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`).
- Entrada validada com Bean Validation (`@Valid` + anotações no DTO — `@NotBlank`, `@Size`, `@DecimalMin`).
- Retorno paginado com `Page<BeneficioDto>` do Spring Data.
- Operação crítica `POST /api/v1/beneficios/transfer` implementa a regra do EJB com `@Transactional(isolation = READ_COMMITTED, rollbackFor = Exception.class)` e `repo.findByIdForUpdate(...)` em ordem determinística.
- **Auditoria automática** em `beneficio_transferencia` para cada tentativa — registros com status `SUCCESS`, `FAILED_INSUFFICIENT`, `FAILED_LOCK`, `FAILED_VALIDATION` ou `FAILED` e mensagem descritiva. Falhas usam transação `REQUIRES_NEW` para sobreviver ao rollback do negócio.

### Qualidade de código
- Java 17 idiomático: `record`, `switch` expression, `var` quando claro, stream API, `Optional` em vez de null-checks.
- Nenhum catch genérico silencioso; exceções de domínio (`BusinessException`) com `HttpStatus` e `code` semântico.
- `GlobalExceptionHandler` garante resposta uniforme para validação, negócio, credenciais inválidas e erros inesperados.
- Logs estruturados via SLF4J com níveis adequados.
- Zero warning de compilação (`mvn clean compile` limpo).
- TypeScript no frontend com `strict` + `strictTemplates` ligados — o build quebra se houver tipagem inconsistente.
- Uso de **signals** no Angular 17 para estado reativo no `AuthService`/componentes.

### Testes automatizados
Cobertura real de cenários críticos em **19 testes**:

- **EJB (6)** — `BeneficioEjbServiceTest` cobre sucesso, saldo insuficiente, valor zero/negativo, mesma conta, origem inexistente e benefício inativo.
- **Backend unitário (8)** — `BeneficioServiceTest` cobre os mesmos casos com o service do Spring Boot + dois cenários de criação (valor negativo rejeitado e sucesso).
- **Backend integração (5)** — `BackendIntegrationTest` sobe o contexto Spring com H2 pré-populado (via `schema-h2.sql` + `data-h2.sql`) e exercita a API end-to-end via `MockMvc`: login inválido, proteção de rota, login válido + listagem, transferência real gravando no banco, rejeição de transferência mesma conta.

`mvn test` em ambos os módulos conclui com 0 falhas. O CI (`.github/workflows/ci.yml`) executa os dois builds automaticamente a cada push.

### Documentação
- Este README com detalhamento técnico completo: stack, arquitetura, análise do bug, contratos REST, deploy em IIS, códigos de erro.
- READMEs específicos em `back/ejb-module/README.md` e `back/backend-module/README.md`.
- **Swagger / OpenAPI 3** disponível em `/teste-integrado/api/swagger-ui.html` com security scheme `bearerAuth`, tags por controller, descrição por operação e modelo de request/response.
- Classes anotadas com `@Tag` e `@Operation` para tornar a doc navegável.
- Comentários Javadoc explicando o raciocínio por trás das correções críticas (lock, ordem de ids, rollback).

### Frontend Angular
SPA profissional em Angular 17 usando **standalone components** e signals:

- **Login** com tema corporativo, progresso indeterminado durante autenticação, credenciais preenchidas para conveniência de avaliação (`teste` / `123456`), feedback de erro via snackbar.
- **Layout persistente** com `mat-sidenav` colorido, menu ativo destacado, menu de usuário com nome + role + logout.
- **Dashboard** com KPIs (total de benefícios, valor consolidado, ativos, inativos), ranking Top 5 por valor e últimas transferências.
- **CRUD de benefícios** com `MatTable` paginada, busca por nome com debounce, diálogos Material de criação/edição/remoção e exibição formatada em BRL via locale `pt-BR`.
- **Transferência** em diálogo dedicado, com selects de origem/destino desabilitando a mesma conta e validação client-side do valor.
- **Auditoria** com tela de histórico de transferências, chips coloridos por status.
- **Interceptor HTTP** adicionando JWT, tratando 401/403 (logout automático) e erros de negócio (snackbar com mensagem do backend).
- **Guards** `authGuard` / `loginGuard` bloqueando acessos indevidos.

---

## 📝 Licença

Projeto entregue como parte do processo seletivo. Uso livre para avaliação técnica.
