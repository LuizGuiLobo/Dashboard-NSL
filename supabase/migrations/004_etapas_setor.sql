-- ══════════════════════════════════════════════════════
-- MIGRATION 004 — Adiciona coluna setor em etapas_kanban
-- e replica etapas padrão para todos os setores
-- ══════════════════════════════════════════════════════

-- 1. Adiciona coluna setor (seguro se já existir)
ALTER TABLE etapas_kanban ADD COLUMN IF NOT EXISTS setor TEXT;

-- 2. Atribui setor padrão às linhas sem setor (seed original da migration 002)
UPDATE etapas_kanban SET setor = 'Bomba Injetora' WHERE setor IS NULL;

-- 3. Replica as etapas padrão para os demais setores
DO $$
DECLARE
  _setores TEXT[] := ARRAY[
    'Bomba de Alta',
    'Injetores Mecânicos',
    'Injetores Eletrônicos',
    'Veículo Diesel',
    'Turbinas'
  ];
  _setor TEXT;
BEGIN
  FOREACH _setor IN ARRAY _setores LOOP
    INSERT INTO etapas_kanban (etapa_id, label, cor, ordem, setor)
    SELECT
      etapa_id || '_' || replace(replace(_setor, ' ', '_'), 'ã', 'a'),
      label, cor, ordem, _setor
    FROM etapas_kanban
    WHERE setor = 'Bomba Injetora'
    ON CONFLICT (etapa_id) DO NOTHING;
  END LOOP;
END $$;

-- 4. Torna coluna NOT NULL
ALTER TABLE etapas_kanban ALTER COLUMN setor SET NOT NULL;

-- 5. Índice para queries por setor
CREATE INDEX IF NOT EXISTS idx_etapas_setor ON etapas_kanban(setor);
