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
  setor: string
  ativo: boolean
  criado_em: string
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
