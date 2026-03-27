-- Migration 004: Suporte a múltiplos setores por operador
-- Cada operador pode agora trabalhar em mais de uma área

ALTER TABLE operadores ADD COLUMN setores TEXT[];
UPDATE operadores SET setores = ARRAY[setor];
ALTER TABLE operadores DROP COLUMN setor;
