-- ══════════════════════════════════════════════════════
-- MIGRATION 002 — Etapas configuráveis do Kanban
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS etapas_kanban (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  etapa_id  TEXT NOT NULL UNIQUE,
  label     TEXT NOT NULL,
  cor       TEXT DEFAULT '#64748b',
  ordem     INT  NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE etapas_kanban ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_total_etapas" ON etapas_kanban USING (true) WITH CHECK (true);

INSERT INTO etapas_kanban (etapa_id, label, cor, ordem) VALUES
  ('diagnostico',          'Diagnóstico',          '#3b82f6', 1),
  ('limpeza_pecas',        'Limpeza de Peças',      '#f59e0b', 2),
  ('aguardando_aprovacao', 'Aguardando Aprovação',  '#ef4444', 3),
  ('em_reparo',            'Em Reparo',             '#10b981', 4),
  ('calibracao',           'Calibração',            '#8b5cf6', 5),
  ('pronto',               'Pronto',                '#10b981', 6),
  ('aguardando_retirada',  'Aguardando Retirada',   '#64748b', 7)
ON CONFLICT (etapa_id) DO NOTHING;
