-- ══════════════════════════════════════════════════════
-- MIGRATION 003 — Operadores por setor e vínculos entre OS
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS operadores (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome      TEXT NOT NULL,
  setores   TEXT[] NOT NULL DEFAULT '{}',
  ativo     BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS os_vinculos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  os_origem    UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  os_destino   UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo_vinculo TEXT DEFAULT 'relacionada',
  obs          TEXT,
  criado_em    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(os_origem, os_destino)
);

ALTER TABLE operadores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_vinculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_total_operadores" ON operadores  USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_vinculos"   ON os_vinculos USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_operadores_nome ON operadores(nome);
CREATE INDEX IF NOT EXISTS idx_vinculos_origem   ON os_vinculos(os_origem);
CREATE INDEX IF NOT EXISTS idx_vinculos_destino  ON os_vinculos(os_destino);

-- Seeds padrão
INSERT INTO operadores (nome, setores) VALUES
  ('João',   ARRAY['Bomba Injetora']),
  ('Carlos', ARRAY['Bomba de Alta']),
  ('Pedro',  ARRAY['Injetores Mecânicos', 'Injetores Eletrônicos']),
  ('João',   ARRAY['Veículo Diesel']),
  ('João',   ARRAY['Turbinas'])
ON CONFLICT DO NOTHING;

INSERT INTO campos_config (campo_id, label, tipo, obrigatorio, ordem) VALUES
  ('telefone',       'Telefone',               'text', false, 1),
  ('modelo_interno', 'Modelo Interno da Peça', 'text', false, 2),
  ('tecnico',        'Técnico Responsável',    'text', false, 3)
ON CONFLICT (campo_id) DO NOTHING;
