-- =========================================================================
-- Desafio Fullstack Integrado - Schema PostgreSQL
-- Autor: Ricardo Master Dev
-- =========================================================================
-- Executar em banco dedicado: CREATE DATABASE teste_integrado;
-- =========================================================================

-- Tabela principal do desafio (alinhada ao enunciado)
CREATE TABLE IF NOT EXISTS beneficio (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    descricao   VARCHAR(255),
    valor       NUMERIC(15,2) NOT NULL CHECK (valor >= 0),
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    version     BIGINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beneficio_ativo ON beneficio(ativo);
CREATE INDEX IF NOT EXISTS idx_beneficio_nome  ON beneficio(nome);

-- Tabela de usuários (para autenticação JWT)
CREATE TABLE IF NOT EXISTS app_user (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL, -- BCrypt hash
    nome        VARCHAR(150) NOT NULL,
    role        VARCHAR(30)  NOT NULL DEFAULT 'USER',
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_user_username ON app_user(username);

-- Auditoria de transferências (para rastrear operações críticas do EJB)
CREATE TABLE IF NOT EXISTS beneficio_transferencia (
    id             BIGSERIAL PRIMARY KEY,
    beneficio_origem_id  BIGINT NOT NULL REFERENCES beneficio(id),
    beneficio_destino_id BIGINT NOT NULL REFERENCES beneficio(id),
    valor          NUMERIC(15,2) NOT NULL,
    usuario        VARCHAR(100),
    status         VARCHAR(30) NOT NULL,      -- SUCCESS, FAILED_INSUFFICIENT, FAILED_LOCK, FAILED
    mensagem       VARCHAR(500),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transf_origem  ON beneficio_transferencia(beneficio_origem_id);
CREATE INDEX IF NOT EXISTS idx_transf_destino ON beneficio_transferencia(beneficio_destino_id);

-- Log de acessos: registra cada tentativa de autenticação (sucesso/falha)
CREATE TABLE IF NOT EXISTS login_log (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    nome        VARCHAR(150),
    ip          VARCHAR(64),
    user_agent  VARCHAR(500),
    sucesso     BOOLEAN NOT NULL,
    mensagem    VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_log_username  ON login_log(username);
CREATE INDEX IF NOT EXISTS idx_login_log_createdat ON login_log(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_beneficio_updated_at ON beneficio;
CREATE TRIGGER trg_beneficio_updated_at
BEFORE UPDATE ON beneficio
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
