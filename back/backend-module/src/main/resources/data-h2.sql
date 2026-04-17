-- Seed para dev (H2)
INSERT INTO beneficio (nome, descricao, valor, ativo) VALUES
  ('Beneficio A', 'Descrição A', 10000.00, TRUE),
  ('Beneficio B', 'Descrição B', 5000.00, TRUE),
  ('Vale Alimentação', 'VR/VA CLT', 800.00, TRUE);

INSERT INTO app_user (username, password, nome, role, ativo) VALUES
  ('teste', '$2b$10$Y0.A8vsZ.G5jcJ32dAP/4.fbFYEj0nnh7F7UPNVaH3gc4V5MA3nmy', 'Usuário Teste', 'ADMIN', TRUE),
  ('admin', '$2b$10$Y0.A8vsZ.G5jcJ32dAP/4.fbFYEj0nnh7F7UPNVaH3gc4V5MA3nmy', 'Administrador', 'ADMIN', TRUE);
