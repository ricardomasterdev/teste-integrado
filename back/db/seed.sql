-- =========================================================================
-- Seed - Dados iniciais para teste
-- =========================================================================

-- Benefícios de exemplo (mantém os originais do enunciado + variações)
INSERT INTO beneficio (nome, descricao, valor, ativo) VALUES
  ('Beneficio A',         'Auxílio mensal categoria A',            10000.00, TRUE),
  ('Beneficio B',         'Auxílio mensal categoria B',             5000.00, TRUE),
  ('Vale Alimentação',    'Benefício de alimentação CLT',           800.00,  TRUE),
  ('Vale Transporte',     'Benefício de transporte coletivo',       220.00,  TRUE),
  ('Auxílio Creche',      'Reembolso auxílio creche',               450.00,  TRUE),
  ('Seguro Saúde',        'Plano saúde empresarial',               1200.00,  TRUE),
  ('Seguro Vida',         'Seguro de vida em grupo',                 75.00,  FALSE)
ON CONFLICT DO NOTHING;

-- Usuário padrão: teste / 123456
-- Hash BCrypt (cost 10) de "123456"
INSERT INTO app_user (username, password, nome, role, ativo) VALUES
  ('teste', '$2b$10$Y0.A8vsZ.G5jcJ32dAP/4.fbFYEj0nnh7F7UPNVaH3gc4V5MA3nmy', 'Usuário Teste',  'ADMIN', TRUE),
  ('admin', '$2b$10$Y0.A8vsZ.G5jcJ32dAP/4.fbFYEj0nnh7F7UPNVaH3gc4V5MA3nmy', 'Administrador',  'ADMIN', TRUE)
ON CONFLICT (username) DO NOTHING;
