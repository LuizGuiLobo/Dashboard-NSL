-- ══════════════════════════════════════════════════════
-- MIGRATION 008 — Adiciona data_conclusao em ordens_servico
-- ══════════════════════════════════════════════════════

ALTER TABLE ordens_servico
  ADD COLUMN IF NOT EXISTS data_conclusao TIMESTAMPTZ;
