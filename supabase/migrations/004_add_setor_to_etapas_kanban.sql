-- Adicionar coluna setor às etapas do kanban (etapas independentes por setor)
ALTER TABLE etapas_kanban ADD COLUMN IF NOT EXISTS setor TEXT NOT NULL DEFAULT 'global';

-- Remover constraint antiga de etapa_id unique
ALTER TABLE etapas_kanban DROP CONSTRAINT IF EXISTS etapas_kanban_etapa_id_key;

-- Nova constraint: etapa única POR setor
ALTER TABLE etapas_kanban ADD CONSTRAINT etapas_kanban_etapa_setor_unique UNIQUE (etapa_id, setor);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_etapas_setor_ordem ON etapas_kanban (setor, ordem);

-- Duplicar etapas globais para cada setor
DO $$
DECLARE
  s TEXT;
  setores TEXT[] := ARRAY['Bomba Injetora','Bomba de Alta','Injetores Mecânicos','Injetores Eletrônicos','Veículo Diesel','Turbinas'];
BEGIN
  FOREACH s IN ARRAY setores LOOP
    INSERT INTO etapas_kanban (id, etapa_id, label, cor, ordem, setor)
    SELECT gen_random_uuid(), etapa_id || '_' || md5(s), label, cor, ordem, s
    FROM etapas_kanban
    WHERE setor = 'global'
    ON CONFLICT (etapa_id, setor) DO NOTHING;
  END LOOP;
  DELETE FROM etapas_kanban WHERE setor = 'global';
END $$;
