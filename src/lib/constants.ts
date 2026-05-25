import type { Setor, Reuniao } from '@/types'

export const SETORES: Setor[] = [
  { nome: 'Bomba Injetora', cor: '#3b82f6', icon: '🔧' },
  { nome: 'Bomba de Alta', cor: '#f59e0b', icon: '⚙️' },
  { nome: 'Injetores Mecânicos', cor: '#10b981', icon: '🔩' },
  { nome: 'Injetores Eletrônicos', cor: '#8b5cf6', icon: '💡' },
  { nome: 'Veículo Diesel', cor: '#ef4444', icon: '🚛' },
  { nome: 'Turbinas', cor: '#06b6d4', icon: '🌀' },
]

export function corDoSetor(setor: string): string {
  return SETORES.find(s => s.nome === setor)?.cor || '#64748b'
}

export function iconDoSetor(setor: string): string {
  return SETORES.find(s => s.nome === setor)?.icon || '📋'
}

export const REUNIOES: Reuniao[] = [
  {
    id: 'r1',
    titulo: 'Alinhamento Semanal',
    dia: 'Segunda',
    hora: '08:00',
    duracao: '30min',
    participantes: ['Todos os setores'],
    pauta: ['Status geral das OS', 'Prioridades da semana', 'Pendências de peças', 'Veículos no pátio'],
    recorrencia: 'semanal',
  },
  {
    id: 'r2',
    titulo: 'Check Rápido — Bombas',
    dia: 'Quarta',
    hora: '08:00',
    duracao: '15min',
    participantes: ['Bomba Injetora', 'Bomba de Alta'],
    pauta: ['Andamento dos serviços', 'Gargalos da semana'],
    recorrencia: 'semanal',
  },
  {
    id: 'r3',
    titulo: 'Check Rápido — Injetores + Turbinas',
    dia: 'Quarta',
    hora: '08:30',
    duracao: '15min',
    participantes: ['Injetores Mecânicos', 'Injetores Eletrônicos', 'Turbinas'],
    pauta: ['Andamento dos serviços', 'Peças em falta'],
    recorrencia: 'semanal',
  },
  {
    id: 'r4',
    titulo: 'Revisão Semanal + Pátio',
    dia: 'Sexta',
    hora: '08:00',
    duracao: '30min',
    participantes: ['Todos os setores', 'Veículo Diesel'],
    pauta: ['Entregas da semana', 'Planejamento próxima semana', 'Situação do pátio'],
    recorrencia: 'semanal',
  },
  {
    id: 'r5',
    titulo: 'Reunião Mensal de Resultados',
    dia: 'Último dia útil',
    hora: '16:00',
    duracao: '1h',
    participantes: ['Todos os setores', 'Diretoria'],
    pauta: ['KPIs do mês', 'OS concluídas vs meta', 'Tempo médio por setor', 'Melhorias para o próximo mês'],
    recorrencia: 'mensal',
  },
]

export const TIPOS_OS = ['Veículo', 'Peça Avulsa'] as const
