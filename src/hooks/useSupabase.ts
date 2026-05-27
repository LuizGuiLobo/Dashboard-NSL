import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { OrdemServico, EtapaKanban, CampoConfig, Operador, OSVinculo, OSHistorico, Profile } from '@/types'

export function useOrdens() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .order('criado_em', { ascending: false })
    if (error) console.error('Erro ao carregar OS:', error.message)
    setOrdens((data as OrdemServico[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const criar = async (os: Partial<OrdemServico>): Promise<string | undefined> => {
    const { data: novo, error } = await supabase
      .from('ordens_servico').insert([os]).select('id').single()
    if (error) throw new Error(error.message)
    if (novo?.id) {
      await supabase.from('os_historico').insert([{
        os_id: novo.id, setor: os.setor || '', status_anterior: '', status_novo: os.status || '',
        operador: os.operador || '', tipo: 'criacao',
      }])
    }
    await carregar()
    return novo?.id
  }

  const atualizar = async (id: string, dados: Partial<OrdemServico>) => {
    const osAtual = ordens.find(o => o.id === id)
    const { error } = await supabase.from('ordens_servico').update(dados).eq('id', id)
    if (error) throw new Error(error.message)
    if (dados.status && osAtual && dados.status !== osAtual.status) {
      await supabase.from('os_historico').insert([{
        os_id: id, setor: osAtual.setor, status_anterior: osAtual.status, status_novo: dados.status,
        operador: dados.operador || osAtual.operador || '', tipo: 'status',
      }])
    } else if (Object.keys(dados).some(k => k !== 'atualizado_em')) {
      await supabase.from('os_historico').insert([{
        os_id: id, setor: osAtual?.setor || '', status_anterior: osAtual?.status || '', status_novo: osAtual?.status || '',
        operador: dados.operador || osAtual?.operador || '', tipo: 'edicao',
      }])
    }
    await carregar()
  }

  const excluir = async (id: string) => {
    await supabase.from('os_historico').delete().eq('os_id', id)
    await supabase.from('os_vinculos').delete().or(`os_origem.eq.${id},os_destino.eq.${id}`)
    const { error } = await supabase.from('ordens_servico').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await carregar()
  }

  return { ordens, loading, carregar, criar, atualizar, excluir }
}

export function useEtapas() {
  // Cache all etapas indexed by setor
  const [todasEtapas, setTodasEtapas] = useState<EtapaKanban[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('etapas_kanban')
      .select('*')
      .order('ordem', { ascending: true })
    if (error) console.error('Erro ao carregar etapas:', error.message)
    setTodasEtapas((data as EtapaKanban[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Get etapas for a specific setor
  const etapasDoSetor = useCallback((setor: string): EtapaKanban[] => {
    return todasEtapas.filter(e => e.setor === setor).sort((a, b) => a.ordem - b.ordem)
  }, [todasEtapas])

  // Get all unique etapas (for dashboard/charts - all labels across all setores)
  const todasEtapasUnicas = useCallback((): EtapaKanban[] => {
    const seen = new Set<string>()
    return todasEtapas.filter(e => {
      if (seen.has(e.label)) return false
      seen.add(e.label)
      return true
    })
  }, [todasEtapas])

  // Save etapas for a specific setor (delete all of that setor, reinsert)
  const salvarSetor = async (setor: string, novasEtapas: Omit<EtapaKanban, 'id'>[]) => {
    const { error: del } = await supabase
      .from('etapas_kanban')
      .delete()
      .eq('setor', setor)
    if (del) throw new Error(del.message)
    if (novasEtapas.length) {
      const etapasComSetor = novasEtapas.map(e => ({ ...e, setor }))
      const { error: ins } = await supabase.from('etapas_kanban').insert(etapasComSetor)
      if (ins) throw new Error(ins.message)
    }
    await carregar()
  }

  return { todasEtapas, loading, carregar, etapasDoSetor, todasEtapasUnicas, salvarSetor }
}

export function useCampos() {
  const [campos, setCampos] = useState<CampoConfig[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('campos_config')
      .select('*')
      .order('ordem', { ascending: true })
    if (error) console.error('Erro ao carregar campos:', error.message)
    setCampos((data as CampoConfig[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const salvar = async (novosCampos: Omit<CampoConfig, 'id'>[]) => {
    const { error: del } = await supabase.from('campos_config').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (del) throw new Error(del.message)
    if (novosCampos.length) {
      const { error: ins } = await supabase.from('campos_config').insert(novosCampos)
      if (ins) throw new Error(ins.message)
    }
    await carregar()
  }

  return { campos, loading, carregar, salvar }
}

export function useOperadores() {
  const [operadores, setOperadores] = useState<Operador[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('operadores')
      .select('*')
      .order('nome', { ascending: true })
    if (error) console.error('Erro ao carregar operadores:', error.message)
    setOperadores((data as Operador[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const salvar = async (novosOps: Omit<Operador, 'id' | 'criado_em'>[]) => {
    const { error: del } = await supabase.from('operadores').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (del) throw new Error(del.message)
    if (novosOps.length) {
      const { error: ins } = await supabase.from('operadores').insert(novosOps)
      if (ins) throw new Error(ins.message)
    }
    await carregar()
  }

  return { operadores, loading, carregar, salvar }
}

export function useVinculos() {
  const [vinculos, setVinculos] = useState<OSVinculo[]>([])

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from('os_vinculos').select('*')
    if (error) console.error('Erro ao carregar vinculos:', error.message)
    setVinculos((data as OSVinculo[]) || [])
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const criar = async (origemId: string, destinoId: string) => {
    const { error } = await supabase.from('os_vinculos').insert([
      { os_origem: origemId, os_destino: destinoId }
    ])
    if (error) throw new Error(error.message)
    await carregar()
  }

  return { vinculos, carregar, criar }
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('v_profiles_com_email')
      .select('*')
      .order('nome', { ascending: true })
    if (error) console.error('Erro ao carregar profiles:', error.message)
    setProfiles((data as Profile[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const salvar = async (id: string, dados: Partial<Profile>) => {
    const { error } = await supabase.from('profiles').update(dados).eq('id', id)
    if (error) throw new Error(error.message)
    await carregar()
  }

  return { profiles, loading, carregar, salvar }
}

export function useResponsaveis(osId: string | null) {
  const [responsaveis, setResponsaveis] = useState<Profile[]>([])

  const carregar = useCallback(async () => {
    if (!osId) { setResponsaveis([]); return }
    const { data, error } = await supabase
      .from('os_responsaveis')
      .select('user_id, v_profiles_com_email!inner(id, nome, email, telefone, setores, role, ativo, criado_em)')
      .eq('os_id', osId)
    if (error) console.error('Erro ao carregar responsaveis:', error.message)
    const lista = (data || []).map((r: Record<string, unknown>) => r['v_profiles_com_email'] as Profile)
    setResponsaveis(lista)
  }, [osId])

  useEffect(() => { carregar() }, [carregar])

  const definir = async (osId: string, userIds: string[]) => {
    await supabase.from('os_responsaveis').delete().eq('os_id', osId)
    if (userIds.length) {
      const rows = userIds.map(user_id => ({ os_id: osId, user_id }))
      const { error } = await supabase.from('os_responsaveis').insert(rows)
      if (error) throw new Error(error.message)
    }
    await carregar()
  }

  return { responsaveis, carregar, definir }
}

export function useHistorico(osId: string | null) {
  const [historico, setHistorico] = useState<OSHistorico[]>([])

  const carregar = useCallback(async () => {
    if (!osId) return
    const { data, error } = await supabase
      .from('os_historico')
      .select('*')
      .eq('os_id', osId)
      .order('criado_em', { ascending: false })
    if (error) console.error('Erro ao carregar historico:', error.message)
    setHistorico((data as OSHistorico[]) || [])
  }, [osId])

  useEffect(() => { carregar() }, [carregar])

  return { historico, carregar }
}
