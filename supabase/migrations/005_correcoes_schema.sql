-- ══════════════════════════════════════════════════════
-- MIGRATION 005 — Correções de schema
-- ══════════════════════════════════════════════════════

-- 1. Dropar views que dependem de data_entrada antes de alterar o tipo
DROP VIEW IF EXISTS v_os_atrasadas;
DROP VIEW IF EXISTS v_os_sla;
DROP VIEW IF EXISTS v_os_timeline;
DROP VIEW IF EXISTS v_operador_ranking;

-- 2. Converter data_entrada de DATE para TIMESTAMPTZ
--    Resolve campo em branco ao editar OS (datetime-local precisa de "2026-03-27T00:00")
ALTER TABLE ordens_servico
  ALTER COLUMN data_entrada TYPE TIMESTAMPTZ
  USING data_entrada::TIMESTAMPTZ;

ALTER TABLE ordens_servico
  ALTER COLUMN data_entrada SET DEFAULT NOW();

-- 3. Corrigir default de etapas_kanban.setor
ALTER TABLE etapas_kanban
  ALTER COLUMN setor SET DEFAULT 'Bomba Injetora';

-- 4. Recriar views com aritmética de data ajustada para TIMESTAMPTZ
CREATE OR REPLACE VIEW v_os_atrasadas AS
SELECT
  id, numero, placa, cliente, setor, status, operador,
  data_entrada,
  (CURRENT_DATE - data_entrada::DATE) AS dias_aguardando
FROM ordens_servico os
WHERE
  (CURRENT_DATE - data_entrada::DATE) >= 5
  AND status NOT IN (
    SELECT ek.label FROM etapas_kanban ek
    WHERE ek.setor = os.setor
    ORDER BY ek.ordem DESC LIMIT 2
  )
ORDER BY (CURRENT_DATE - data_entrada::DATE) DESC;

CREATE OR REPLACE VIEW v_os_sla AS
SELECT
  os.id, os.numero, os.placa, os.cliente, os.setor,
  os.status, os.operador, os.data_entrada,
  (CURRENT_DATE - os.data_entrada::DATE) AS dias_totais,
  COUNT(h.id) AS total_movimentacoes,
  MAX(h.criado_em) AS ultima_movimentacao
FROM ordens_servico os
LEFT JOIN os_historico h ON h.os_id = os.id
GROUP BY os.id, os.numero, os.placa, os.cliente, os.setor,
         os.status, os.operador, os.data_entrada;

CREATE OR REPLACE VIEW v_os_timeline AS
SELECT
  h.id, h.os_id, os.numero, os.placa, os.cliente,
  h.setor, h.status_anterior, h.status_novo,
  h.operador, h.tipo, h.criado_em,
  EXTRACT(epoch FROM (h.criado_em - LAG(h.criado_em) OVER (PARTITION BY h.os_id ORDER BY h.criado_em))) / 3600.0 AS horas_no_status_anterior
FROM os_historico h
JOIN ordens_servico os ON os.id = h.os_id
ORDER BY h.os_id, h.criado_em;

CREATE OR REPLACE VIEW v_operador_ranking AS
SELECT
  o.id, o.nome, o.setores,
  COALESCE(g.xp, 0) AS xp,
  COALESCE(g.level, 1) AS level,
  COALESCE(g.streak_count, 0) AS streak_count,
  COALESCE(g.best_streak, 0) AS best_streak,
  COALESCE(g.total_os_completed, 0) AS total_os_completed,
  COALESCE(g.total_kanban_moves, 0) AS total_kanban_moves,
  COALESCE(g.total_missions_completed, 0) AS total_missions_completed,
  g.last_active
FROM operadores o
LEFT JOIN operadores_gamification g ON g.operador_id = o.id
WHERE o.ativo = true
ORDER BY COALESCE(g.xp, 0) DESC;
