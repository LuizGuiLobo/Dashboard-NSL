-- 004_os_setores.sql
-- Tabela para rastrear setores adicionais de uma OS (multi-setor)
-- Cada OS pode aparecer em múltiplos setores com status/operador próprios.

CREATE TABLE IF NOT EXISTS os_setores (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id       UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  setor       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Diagnóstico',
  operador    TEXT DEFAULT '',
  ordem       INT DEFAULT 1,
  observacoes TEXT DEFAULT '',
  criado_em   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(os_id, setor)
);

ALTER TABLE os_setores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_total_os_setores" ON os_setores USING (true) WITH CHECK (true);
CREATE INDEX idx_os_setores_os ON os_setores(os_id);
CREATE INDEX idx_os_setores_setor ON os_setores(setor);
