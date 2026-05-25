-- ══════════════════════════════════════════════════════
-- MIGRATION 002 — Etapas configuráveis do Kanban por setor
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS etapas_kanban (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  etapa_id  TEXT NOT NULL UNIQUE,
  label     TEXT NOT NULL,
  cor       TEXT DEFAULT '#64748b',
  ordem     INT  NOT NULL DEFAULT 0,
  setor     TEXT NOT NULL DEFAULT 'Bomba Injetora',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE etapas_kanban ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_total_etapas" ON etapas_kanban USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_etapas_setor ON etapas_kanban(setor);

INSERT INTO etapas_kanban (etapa_id, label, cor, ordem, setor) VALUES
  ('diagnostico_Bomba_Injetora',          'Diagnóstico',         '#3b82f6', 1, 'Bomba Injetora'),
  ('limpeza_pecas_Bomba_Injetora',        'Limpeza de Peças',    '#f59e0b', 2, 'Bomba Injetora'),
  ('aguardando_aprovacao_Bomba_Injetora', 'Aguardando Aprovação','#ef4444', 3, 'Bomba Injetora'),
  ('em_reparo_Bomba_Injetora',            'Em Reparo',           '#10b981', 4, 'Bomba Injetora'),
  ('calibracao_Bomba_Injetora',           'Calibração',          '#8b5cf6', 5, 'Bomba Injetora'),
  ('pronto_Bomba_Injetora',               'Pronto',              '#10b981', 6, 'Bomba Injetora'),
  ('aguardando_retirada_Bomba_Injetora',  'Aguardando Retirada', '#64748b', 7, 'Bomba Injetora'),

  ('diagnostico_Bomba_de_Alta',          'Diagnóstico',         '#3b82f6', 1, 'Bomba de Alta'),
  ('limpeza_pecas_Bomba_de_Alta',        'Limpeza de Peças',    '#f59e0b', 2, 'Bomba de Alta'),
  ('aguardando_aprovacao_Bomba_de_Alta', 'Aguardando Aprovação','#ef4444', 3, 'Bomba de Alta'),
  ('em_reparo_Bomba_de_Alta',            'Em Reparo',           '#10b981', 4, 'Bomba de Alta'),
  ('calibracao_Bomba_de_Alta',           'Calibração',          '#8b5cf6', 5, 'Bomba de Alta'),
  ('pronto_Bomba_de_Alta',               'Pronto',              '#10b981', 6, 'Bomba de Alta'),
  ('aguardando_retirada_Bomba_de_Alta',  'Aguardando Retirada', '#64748b', 7, 'Bomba de Alta'),

  ('diagnostico_Injetores_Mecanicos',          'Diagnóstico',         '#3b82f6', 1, 'Injetores Mecânicos'),
  ('limpeza_pecas_Injetores_Mecanicos',        'Limpeza de Peças',    '#f59e0b', 2, 'Injetores Mecânicos'),
  ('aguardando_aprovacao_Injetores_Mecanicos', 'Aguardando Aprovação','#ef4444', 3, 'Injetores Mecânicos'),
  ('em_reparo_Injetores_Mecanicos',            'Em Reparo',           '#10b981', 4, 'Injetores Mecânicos'),
  ('calibracao_Injetores_Mecanicos',           'Calibração',          '#8b5cf6', 5, 'Injetores Mecânicos'),
  ('pronto_Injetores_Mecanicos',               'Pronto',              '#10b981', 6, 'Injetores Mecânicos'),
  ('aguardando_retirada_Injetores_Mecanicos',  'Aguardando Retirada', '#64748b', 7, 'Injetores Mecânicos'),

  ('diagnostico_Injetores_Eletronicos',          'Diagnóstico',         '#3b82f6', 1, 'Injetores Eletrônicos'),
  ('limpeza_pecas_Injetores_Eletronicos',        'Limpeza de Peças',    '#f59e0b', 2, 'Injetores Eletrônicos'),
  ('aguardando_aprovacao_Injetores_Eletronicos', 'Aguardando Aprovação','#ef4444', 3, 'Injetores Eletrônicos'),
  ('em_reparo_Injetores_Eletronicos',            'Em Reparo',           '#10b981', 4, 'Injetores Eletrônicos'),
  ('calibracao_Injetores_Eletronicos',           'Calibração',          '#8b5cf6', 5, 'Injetores Eletrônicos'),
  ('pronto_Injetores_Eletronicos',               'Pronto',              '#10b981', 6, 'Injetores Eletrônicos'),
  ('aguardando_retirada_Injetores_Eletronicos',  'Aguardando Retirada', '#64748b', 7, 'Injetores Eletrônicos'),

  ('diagnostico_Veiculo_Diesel',          'Diagnóstico',         '#3b82f6', 1, 'Veículo Diesel'),
  ('limpeza_pecas_Veiculo_Diesel',        'Limpeza de Peças',    '#f59e0b', 2, 'Veículo Diesel'),
  ('aguardando_aprovacao_Veiculo_Diesel', 'Aguardando Aprovação','#ef4444', 3, 'Veículo Diesel'),
  ('em_reparo_Veiculo_Diesel',            'Em Reparo',           '#10b981', 4, 'Veículo Diesel'),
  ('calibracao_Veiculo_Diesel',           'Calibração',          '#8b5cf6', 5, 'Veículo Diesel'),
  ('pronto_Veiculo_Diesel',               'Pronto',              '#10b981', 6, 'Veículo Diesel'),
  ('aguardando_retirada_Veiculo_Diesel',  'Aguardando Retirada', '#64748b', 7, 'Veículo Diesel'),

  ('diagnostico_Turbinas',          'Diagnóstico',         '#3b82f6', 1, 'Turbinas'),
  ('limpeza_pecas_Turbinas',        'Limpeza de Peças',    '#f59e0b', 2, 'Turbinas'),
  ('aguardando_aprovacao_Turbinas', 'Aguardando Aprovação','#ef4444', 3, 'Turbinas'),
  ('em_reparo_Turbinas',            'Em Reparo',           '#10b981', 4, 'Turbinas'),
  ('calibracao_Turbinas',           'Calibração',          '#8b5cf6', 5, 'Turbinas'),
  ('pronto_Turbinas',               'Pronto',              '#10b981', 6, 'Turbinas'),
  ('aguardando_retirada_Turbinas',  'Aguardando Retirada', '#64748b', 7, 'Turbinas')
ON CONFLICT (etapa_id) DO NOTHING;
