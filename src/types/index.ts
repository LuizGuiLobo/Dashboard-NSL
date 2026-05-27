export interface OrdemServico {
  id: string
  numero: string
  tipo: string
  placa: string
  cliente: string
  modelo: string
  setor: string
  status: string
  data_entrada: string
  observacoes: string
  operador: string
  extras: Record<string, unknown>
  criado_em: string
  atualizado_em: string
}

export interface EtapaKanban {
  id: string
  etapa_id?: string
  label: string
  cor: string
  ordem: number
  setor: string
}

export interface CampoConfig {
  id: string
  campo_id?: string
  label: string
  tipo: 'text' | 'number' | 'date' | 'select'
  opcoes: string[]
  obrigatorio: boolean
  ordem: number
}

export interface Operador {
  id: string
  nome: string
  setores: string[]
  ativo: boolean
  criado_em: string
}

export interface OSHistorico {
  id: string
  os_id: string
  setor: string
  status_anterior: string
  status_novo: string
  operador: string
  tipo: 'status' | 'criacao' | 'edicao'
  criado_em: string
}

export interface KanbanItem {
  os_setor_id: string
  setor: string
  status_atual: string
  setor_inicio: string
  finalizado_em: string | null
  setor_principal: string
  os_id: string
  numero: string
  tipo: string
  placa: string
  cliente: string
  modelo: string
  operador: string
  observacoes: string
  extras: Record<string, unknown>
  data_entrada: string
  criado_em: string
}

export interface OSStatusLog {
  id: string
  os_setor_id: string
  status: string
  inicio: string
  fim: string | null
  duracao_minutos: number | null
}

export interface OSSetorDetalhe {
  id: string
  os_id: string
  setor: string
  status_atual: string
  criado_em: string
  finalizado_em: string | null
  os_status_log?: OSStatusLog[]
}

export interface Profile {
  id: string
  nome: string
  role: 'admin' | 'user'
  ativo: boolean
  setores: string[]
  telefone: string
  criado_em: string
  email?: string
}

export interface OSResponsavel {
  id: string
  os_id: string
  user_id: string
  atribuido_em: string
  profile?: Profile
}

export interface OSVinculo {
  id: string
  os_origem: string
  os_destino: string
  tipo_vinculo: string
  obs: string
  criado_em: string
}

export interface Setor {
  nome: string
  cor: string
  icon: string
}

export interface Reuniao {
  id: string
  titulo: string
  dia: string
  hora: string
  duracao: string
  participantes: string[]
  pauta: string[]
  recorrencia: 'semanal' | 'mensal'
}
