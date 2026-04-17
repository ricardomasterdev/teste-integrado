# Backend Spring Boot 3

## Perfis

| Perfil | Banco | Uso |
|--------|-------|-----|
| `prod` | PostgreSQL (177.53.148.179:5432/teste_integrado) | Produção em dev1 |
| `dev`  | H2 in-memory | Desenvolvimento local |
| `test` | H2 in-memory | Testes automatizados |

## Rodar local (H2)

```bash
cd back/backend-module
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Acesse:
- API: http://localhost:8090/teste-integrado/api/api/v1/beneficios
- Swagger: http://localhost:8090/teste-integrado/api/swagger-ui.html

## Rodar contra PostgreSQL dev1

```bash
mvn -DskipTests package
java -jar target/backend.jar --spring.profiles.active=prod
```

## Endpoints principais

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/api/v1/auth/login` | Login e obtenção de JWT |
| GET  | `/api/v1/beneficios` | Lista paginada (param: `nome`, `page`, `size`) |
| GET  | `/api/v1/beneficios/{id}` | Buscar por ID |
| POST | `/api/v1/beneficios` | Criar |
| PUT  | `/api/v1/beneficios/{id}` | Atualizar |
| DELETE | `/api/v1/beneficios/{id}` | Remover |
| POST | `/api/v1/beneficios/transfer` | Transferência atômica com locking |
| GET  | `/api/v1/transferencias` | Histórico/auditoria |

## Testes

```bash
mvn test
```
