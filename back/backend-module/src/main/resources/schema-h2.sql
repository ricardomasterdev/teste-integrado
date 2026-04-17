-- Schema para perfil H2 (dev). Em prod o schema já existe no PostgreSQL.
CREATE TABLE IF NOT EXISTS beneficio (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    descricao   VARCHAR(255),
    valor       DECIMAL(15,2) NOT NULL,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    version     BIGINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_user (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username   VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    nome       VARCHAR(150) NOT NULL,
    role       VARCHAR(30)  NOT NULL DEFAULT 'USER',
    ativo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beneficio_transferencia (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    beneficio_origem_id  BIGINT NOT NULL,
    beneficio_destino_id BIGINT NOT NULL,
    valor                DECIMAL(15,2) NOT NULL,
    usuario              VARCHAR(100),
    status               VARCHAR(30) NOT NULL,
    mensagem             VARCHAR(500),
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS login_log (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    nome        VARCHAR(150),
    ip          VARCHAR(64),
    user_agent  VARCHAR(500),
    sucesso     BOOLEAN NOT NULL,
    mensagem    VARCHAR(255),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
