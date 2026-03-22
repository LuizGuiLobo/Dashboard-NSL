-- ══════════════════════════════════════════════════════
-- MIGRATION 001 — Tabelas principais
-- Nova São Luiz Diesel · Supabase São Paulo (sa-east-1)
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ordens_servico (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero        TEXT NOT NULL UNIQUE,
  tipo          TEXT NOT NULL DEFAULT 'veiculo',
  placa         TEXT NOT NULL,
  cliente       TEXT NOT NULL,
  modelo        TEXT,
  setor         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Diagnóstico',
  data_entrada  DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes   TEXT,
  operador      TEXT DEFAULT '',
  extras        JSONB DEFAULT '{}',
  criado_em     TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campos_config (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campo_id    TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  tipo        TEXT NOT NULL DEFAULT 'text',
  opcoes      JSONB DEFAULT '[]',
  obrigatorio BOOLEAN DEFAULT FALSE,
  ordem       INT DEFAULT 0,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_os_timestamp
  BEFORE UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE INDEX idx_os_status  ON ordens_servico(status);
CREATE INDEX idx_os_setor   ON ordens_servico(setor);
CREATE INDEX idx_os_placa   ON ordens_servico(placa);
CREATE INDEX idx_os_cliente ON ordens_servico(LOWER(cliente));
CREATE INDEX idx_os_numero  ON ordens_servico(numero);

ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE campos_config  ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_total_os"     ON ordens_servico USING (true) WITH CHECK (true);
CREATE POLICY "acesso_total_campos" ON campos_config  USING (true) WITH CHECK (true);
