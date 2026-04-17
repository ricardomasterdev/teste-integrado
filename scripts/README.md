# Scripts de execução

Scripts `.bat` para Windows, prontos para rodar localmente ou em servidores dev.

| Script | O que faz |
|--------|-----------|
| `run-backend.bat`  | Compila (se necessário) e inicia o backend Spring Boot em `http://localhost:8090/teste-integrado/api` |
| `run-frontend.bat` | Instala dependências (se necessário) e inicia o Angular em `http://localhost:4200` |
| `run-all.bat`      | Sobe backend + frontend em janelas de terminal separadas |
| `build-prod.bat`   | Faz build de produção: `backend.jar` + `front/dist/` |

## Variáveis de ambiente suportadas (backend)

As variáveis têm defaults sensatos; defina antes de chamar o `.bat` para sobrescrever.

| Variável | Default | Descrição |
|----------|---------|-----------|
| `SPRING_PROFILES_ACTIVE` | `prod` | Profile Spring Boot (`prod`/`dev`/`test`) |
| `SERVER_PORT`            | `8090` | Porta do backend |
| `DB_HOST`                | `177.53.148.179` | PostgreSQL host |
| `DB_PORT`                | `5432` | PostgreSQL port |
| `DB_NAME`                | `teste_integrado` | Nome do banco |
| `DB_USER`                | `codex` | Usuário do banco |
| `DB_PASSWORD`            | `Ric@7901` | Senha do banco |
| `APP_JWT_SECRET`         | valor de exemplo | Segredo HS256 (min 32 bytes) |
| `APP_JWT_EXPIRATION_MS`  | `28800000` | Validade do JWT em ms (8h) |
| `JAVA_HOME`              | detectado automático | Caminho do JDK 17 |

## Exemplo de uso

```cmd
REM Rodar tudo
scripts\run-all.bat

REM Sobrescrever porta do backend
set SERVER_PORT=9000
scripts\run-backend.bat

REM Build de produção
scripts\build-prod.bat
```
