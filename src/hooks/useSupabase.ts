import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { OrdemServico, EtapaKanban, CampoConfig, Operador, OSVinculo } from '@/types'

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

  const criar = async (os: Partial<OrdemServico>) => {
    const { error } = await supabase.from('ordens_servico').insert([os])
    if (error) throw new Error(error.message)
    await carregar()
  }

  const atualizar = async (id: string, dados: Partial<OrdemServico>) => {
    const { error } = await supabase.from('ordens_servico').update(dados).eq('id', id)
    if (error) throw new Error(error.message)
    await carregar()
  }

  const excluir = async (id: string) => {
    await supabase.from('os_vinculos').delete().or(`os_origem.eq.${id},os_destino.eq.${id}`)
    const { error } = await supabase.from('ordens_servico').delete().eq('id', id)
    if (error) throw new Error(error.message)
    await carregar()
  }

  return { ordens, loading, carregar, criar, atualizar, excluir }
}

export function useEtapas() {
  const [etapas, setEtapas] = useState<EtapaKanban[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('etapas_kanban')
      .select('*')
      .order('ordem', { ascending: true })
    if (error) console.error('Erro ao carregar etapas:', error.message)
    setEtapas((data as EtapaKanban[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const salvar = async (novasEtapas: Omit<EtapaKanban, 'id'>[]) => {
    const { error: del } = await supabase.from('etapas_kanban').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (del) throw new Error(del.message)
    if (novasEtapas.length) {
      const { error: ins } = await supabase.from('etapas_kanban').insert(novasEtapas)
      if (ins) throw new Error(ins.message)
    }
    await carregar()
  }

  return { etapas, loading, carregar, salvar }
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
