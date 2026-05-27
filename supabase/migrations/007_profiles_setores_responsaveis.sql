-- ══════════════════════════════════════════════════════
-- MIGRATION 007 — Perfis com setores + OS responsáveis
-- ══════════════════════════════════════════════════════

-- 1. Adicionar campos em profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS setores  TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS telefone TEXT    NOT NULL DEFAULT '';

-- 2. Tabela de responsáveis por OS (N usuários por OS)
CREATE TABLE IF NOT EXISTS os_responsaveis (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id        UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
  atribuido_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (os_id, user_id)
);

ALTER TABLE os_responsaveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leitura_responsaveis" ON os_responsaveis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "escrita_responsaveis" ON os_responsaveis
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. View: perfis com email do auth
CREATE OR REPLACE VIEW v_profiles_com_email AS
SELECT
  p.id,
  p.nome,
  p.role,
  p.ativo,
  p.setores,
  p.telefone,
  p.criado_em,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id;

GRANT SELECT ON v_profiles_com_email TO authenticated;
