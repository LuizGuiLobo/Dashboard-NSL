-- ══════════════════════════════════════════════════════
-- MIGRATION 009 — Adiciona 'conclusao' ao check constraint de os_historico.tipo
-- ══════════════════════════════════════════════════════

ALTER TABLE os_historico DROP CONSTRAINT IF EXISTS os_historico_tipo_check;
ALTER TABLE os_historico ADD CONSTRAINT os_historico_tipo_check
  CHECK (tipo IN ('status', 'criacao', 'edicao', 'conclusao'));
