-- ══════════════════════════════════════════════════════
-- MIGRATION 010 — Adiciona 'finalizacao' ao check constraint de os_historico.tipo
-- O RPC finalizar_os insere tipo='finalizacao' que nao estava no constraint
-- ══════════════════════════════════════════════════════

ALTER TABLE os_historico DROP CONSTRAINT IF EXISTS os_historico_tipo_check;
ALTER TABLE os_historico ADD CONSTRAINT os_historico_tipo_check
  CHECK (tipo IN ('status', 'criacao', 'edicao', 'conclusao', 'finalizacao'));
