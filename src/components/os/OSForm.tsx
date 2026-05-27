import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, ChevronDown, Phone, User, X, Plus, Layers, Clock, Trash2 } from 'lucide-react'
import { SETORES, TIPOS_OS, corDoSetor } from '@/lib/constants'
import { gerarNumeroOS } from '@/lib/utils'
import { useHistorico, useResponsaveis, useOSSetoresParaOS } from '@/hooks/useSupabase'
import { supabase } from '@/lib/supabase'
import type { OrdemServico, EtapaKanban, CampoConfig, Profile } from '@/types'

interface SetorExtra {
  setor: string
  status: string
}

interface OSFormProps {
  os?: OrdemServico | null
  etapasDoSetor: (setor: string) => EtapaKanban[]
  campos: CampoConfig[]
  operadores?: never[]
  profiles: Profile[]
  ordens: OrdemServico[]
  onSave: (data: Partial<OrdemServico>, vinculoId?: string, responsaveisIds?: string[], setoresIniciais?: SetorExtra[]) => void
  onCancel: () => void
  saving?: boolean
  // Gerenciamento de setores ao editar
  onAdicionarSetor?: (osId: string, setor: string, statusInicial: string) => Promise<void>
  onRemoverSetor?: (osSetorId: string) => Promise<void>
  onCarregarKanban?: () => Promise<void>
}

export function OSForm({
  os, etapasDoSetor, campos, profiles, ordens,
  onSave, onCancel, saving,
  onAdicionarSetor, onRemoverSetor, onCarregarKanban,
}: OSFormProps) {
  const isEdit = !!os
  const submittingRef = useRef(false)
  const [vinculoAberto, setVinculoAberto] = useState(false)
  const { historico } = useHistorico(os?.id || null)
  const { responsaveis: responsaveisSalvos } = useResponsaveis(os?.id || null)
  const { setores: setoresDB, carregar: recarregarSetores } = useOSSetoresParaOS(os?.id || null)

  const [form, setForm] = useState({
    numero: os?.numero || gerarNumeroOS(),
    tipo: os?.tipo || 'Veículo',
    placa: os?.placa || '',
    cliente: os?.cliente || '',
    modelo: os?.modelo || '',
    setor: os?.setor || SETORES[0].nome,
    status: os?.status || '',
    data_entrada: os?.data_entrada ? os.data_entrada.slice(0, 16) : new Date().toISOString().slice(0, 16),
    observacoes: os?.observacoes || '',
    extras: (os?.extras || {}) as Record<string, string>,
    vinculo: '',
  })

  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState<string[]>([])

  // Setores extras para criação (além do setor principal)
  const [setoresExtras, setSetoresExtras] = useState<SetorExtra[]>([])
  const [adicionandoSetor, setAdicionandoSetor] = useState(false)
  const [novoSetor, setNovoSetor] = useState(SETORES[0].nome)
  const [novoStatus, setNovoStatus] = useState('')

  // Para edição: mudança de status por setor
  const [mudandoStatusSetor, setMudandoStatusSetor] = useState<Record<string, string>>({})
  const [loadingSetorAction, setLoadingSetorAction] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit && responsaveisSalvos.length) {
      setResponsaveisSelecionados(responsaveisSalvos.map(r => r.id))
    }
  }, [responsaveisSalvos, isEdit])

  const etapasAtuais = useMemo(() => etapasDoSetor(form.setor), [etapasDoSetor, form.setor])

  useEffect(() => {
    if (!isEdit && etapasAtuais.length > 0) {
      setForm(prev => ({ ...prev, status: etapasAtuais[0].label }))
    }
  }, [form.setor, etapasAtuais, isEdit])

  useEffect(() => {
    if (!isEdit && !form.status && etapasAtuais.length > 0) {
      setForm(prev => ({ ...prev, status: etapasAtuais[0].label }))
    }
  }, [])

  // Ao abrir painel de novo setor, definir status inicial
  useEffect(() => {
    const etapas = etapasDoSetor(novoSetor)
    setNovoStatus(etapas[0]?.label || '')
  }, [novoSetor, etapasDoSetor])

  const usuariosDoSetor = useMemo(
    () => profiles.filter(p => p.ativo && p.setores?.includes(form.setor)),
    [profiles, form.setor]
  )
  const osDisponiveis = ordens.filter(o => o.id !== os?.id && o.setor !== form.setor)

  // Setores já em uso (para evitar duplicatas ao adicionar)
  const setoresEmUso = useMemo(() => {
    if (!isEdit) {
      return [form.setor, ...setoresExtras.map(s => s.setor)]
    }
    return setoresDB.map(s => s.setor)
  }, [isEdit, form.setor, setoresExtras, setoresDB])

  const setoresDisponiveis = SETORES.filter(s => !setoresEmUso.includes(s.nome))

  const set = (field: string, value: string) => {
    if (field === 'setor' && !isEdit) {
      const novasEtapas = etapasDoSetor(value)
      setForm(prev => ({
        ...prev, setor: value,
        status: novasEtapas.length > 0 ? novasEtapas[0].label : '',
      }))
      setResponsaveisSelecionados([])
      return
    }
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const setExtra = (key: string, value: string) => setForm(prev => ({
    ...prev, extras: { ...prev.extras, [key]: value },
  }))

  const toggleResponsavel = (id: string) => {
    setResponsaveisSelecionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Adicionar setor extra (modo criação)
  const adicionarSetorExtra = () => {
    if (!novoSetor || !novoStatus) return
    setSetoresExtras(prev => [...prev, { setor: novoSetor, status: novoStatus }])
    setAdicionandoSetor(false)
    // Reset para próximo
    const disponivel = SETORES.find(s => !setoresEmUso.includes(s.nome) && s.nome !== novoSetor)
    if (disponivel) setNovoSetor(disponivel.nome)
  }

  const removerSetorExtra = (idx: number) => {
    setSetoresExtras(prev => prev.filter((_, i) => i !== idx))
  }

  // Adicionar setor ao editar (chamada imediata ao banco)
  const handleAdicionarSetorEdit = async () => {
    if (!os || !onAdicionarSetor || !novoSetor || !novoStatus) return
    setLoadingSetorAction('add')
    try {
      await onAdicionarSetor(os.id, novoSetor, novoStatus)
      await recarregarSetores()
      onCarregarKanban?.()
      setAdicionandoSetor(false)
    } catch (e: unknown) {
      console.error((e as Error).message)
    }
    setLoadingSetorAction(null)
  }

  // Remover setor ao editar
  const handleRemoverSetorEdit = async (osSetorId: string) => {
    if (!onRemoverSetor) return
    if (!confirm('Remover este setor da OS?')) return
    setLoadingSetorAction(osSetorId)
    try {
      await onRemoverSetor(osSetorId)
      await recarregarSetores()
      onCarregarKanban?.()
    } catch (e: unknown) {
      console.error((e as Error).message)
    }
    setLoadingSetorAction(null)
  }

  // Mudar status de um setor ao editar
  const handleMoverStatusEdit = async (osSetorId: string, novoStatusVal: string) => {
    setLoadingSetorAction(osSetorId + '_status')
    try {
      const { error } = await supabase.rpc('mover_status_setor', {
        p_os_setor_id: osSetorId,
        p_novo_status: novoStatusVal,
      })
      if (error) throw new Error(error.message)
      await recarregarSetores()
      onCarregarKanban?.()
      setMudandoStatusSetor(prev => { const n = { ...prev }; delete n[osSetorId]; return n })
    } catch (e: unknown) {
      console.error((e as Error).message)
    }
    setLoadingSetorAction(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cliente.trim()) return
    if (submittingRef.current) return
    submittingRef.current = true
    const { vinculo, ...rest } = form
    const setoresIniciais = setoresExtras.length > 0 ? setoresExtras : undefined
    onSave(rest, vinculo || undefined, responsaveisSelecionados, setoresIniciais)
    setTimeout(() => { submittingRef.current = false }, 3000)
  }

  const statusDesconhecido = form.status && etapasAtuais.length > 0 && !etapasAtuais.find(e => e.label === form.status)

  const inputClass = 'w-full bg-dark-surface2 border border-dark-border rounded-lg px-3 py-2.5 text-sm text-onsurface font-body placeholder-dark-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all'
  const labelClass = 'text-xs font-body font-semibold text-dark-muted uppercase tracking-wider mb-1.5 block'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Numero da OS</label>
          <input className={inputClass} value={form.numero} onChange={e => set('numero', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Tipo</label>
          <select className={inputClass} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            {TIPOS_OS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Placa</label>
          <input className={inputClass} value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} placeholder="ABC-1234" />
        </div>
        <div>
          <label className={labelClass}>Cliente *</label>
          <input className={inputClass} value={form.cliente} onChange={e => set('cliente', e.target.value)} required placeholder="Nome do cliente" />
        </div>
        <div>
          <label className={labelClass}>Modelo</label>
          <input className={inputClass} value={form.modelo} onChange={e => set('modelo', e.target.value)} placeholder="Ex: Scania R450" />
        </div>
        <div>
          <label className={labelClass}>Data de Entrada</label>
          <input type="datetime-local" className={inputClass} value={form.data_entrada} onChange={e => set('data_entrada', e.target.value)} />
        </div>
      </div>

      {/* ── SETORES DA OS ── */}
      <div className="border-t border-dark-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-display tracking-wider text-dark-muted flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" /> SETORES DESTA OS
          </p>
          {setoresDisponiveis.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setNovoSetor(setoresDisponiveis[0].nome)
                setAdicionandoSetor(v => !v)
              }}
              className="flex items-center gap-1 text-xs font-body font-semibold text-accent hover:text-accent-hover transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar setor
            </button>
          )}
        </div>

        {/* Setor principal (modo criação) — setor + status editáveis dentro do card */}
        {!isEdit && (
          <div
            className="px-3 py-3 rounded-lg mb-2 border"
            style={{
              backgroundColor: `${corDoSetor(form.setor)}10`,
              borderColor: `${corDoSetor(form.setor)}30`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: corDoSetor(form.setor) }} />
              <span className="text-[10px] text-dark-muted font-mono uppercase tracking-wider">Setor principal</span>
            </div>
            <div className="flex gap-2">
              <select
                className="flex-1 text-sm bg-dark-surface2 border border-dark-border rounded-lg px-3 py-2 text-onsurface font-body focus:outline-none focus:border-accent transition-all"
                value={form.setor}
                onChange={e => set('setor', e.target.value)}
              >
                {SETORES.map(s => <option key={s.nome} value={s.nome}>{s.icon} {s.nome}</option>)}
              </select>
              <AnimatePresence mode="wait">
                <motion.div key={form.setor} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="flex-1">
                  {statusDesconhecido && (
                    <p className="text-[10px] text-yellow-400 mb-1 font-body">⚠️ Status desconhecido</p>
                  )}
                  <select
                    className="w-full text-sm bg-dark-surface2 border border-dark-border rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-accent transition-all"
                    style={{ color: corDoSetor(form.setor) }}
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                  >
                    {statusDesconhecido && <option value={form.status}>⚠️ {form.status}</option>}
                    {etapasAtuais.map(e => <option key={e.id} value={e.label}>{e.label}</option>)}
                    {etapasAtuais.length === 0 && <option value="">Nenhuma etapa</option>}
                  </select>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Setores extras (modo criação) */}
        {!isEdit && setoresExtras.map((s, idx) => {
          const etapas = etapasDoSetor(s.setor)
          return (
            <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2 border border-dark-border bg-dark-surface2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: corDoSetor(s.setor) }} />
              <span className="text-sm font-body font-semibold text-onsurface flex-1">{s.setor}</span>
              <select
                className="text-xs bg-dark-surface border border-dark-border rounded px-2 py-1 text-onsurface font-mono"
                value={s.status}
                onChange={e => setSetoresExtras(prev => prev.map((x, i) => i === idx ? { ...x, status: e.target.value } : x))}
              >
                {etapas.map(e => <option key={e.id} value={e.label}>{e.label}</option>)}
              </select>
              <button type="button" onClick={() => removerSetorExtra(idx)} className="p-1 rounded text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}

        {/* Setores do banco (modo edição) */}
        {isEdit && setoresDB.map(s => {
          const etapas = etapasDoSetor(s.setor)
          const isPrincipal = s.setor === os?.setor
          const editandoStatus = mudandoStatusSetor[s.id] !== undefined
          const loadingThis = loadingSetorAction === s.id || loadingSetorAction === s.id + '_status'
          const logRecente = s.os_status_log?.[0]
          const minutos = logRecente?.inicio
            ? Math.floor((Date.now() - new Date(logRecente.inicio).getTime()) / 60000)
            : null

          return (
            <div key={s.id} className="px-3 py-2 rounded-lg mb-2 border border-dark-border bg-dark-surface2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: corDoSetor(s.setor) }} />
                  <span className="text-sm font-body font-semibold text-onsurface">{s.setor}</span>
                  {isPrincipal && <span className="text-[10px] text-dark-muted font-mono bg-dark-surface px-1.5 py-0.5 rounded">principal</span>}
                </div>
                <div className="flex items-center gap-1">
                  {/* Status atual ou seletor */}
                  {editandoStatus ? (
                    <div className="flex items-center gap-1">
                      <select
                        className="text-xs bg-dark-surface border border-dark-border rounded px-2 py-1 text-onsurface font-mono"
                        value={mudandoStatusSetor[s.id]}
                        onChange={e => setMudandoStatusSetor(prev => ({ ...prev, [s.id]: e.target.value }))}
                      >
                        {etapas.map(e => <option key={e.id} value={e.label}>{e.label}</option>)}
                      </select>
                      <button
                        type="button"
                        disabled={!!loadingSetorAction}
                        onClick={() => handleMoverStatusEdit(s.id, mudandoStatusSetor[s.id])}
                        className="text-xs px-2 py-1 rounded bg-accent text-black font-bold disabled:opacity-50"
                      >
                        {loadingThis ? '...' : 'OK'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMudandoStatusSetor(prev => { const n = { ...prev }; delete n[s.id]; return n })}
                        className="p-1 rounded text-dark-muted hover:text-onsurface"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMudandoStatusSetor(prev => ({ ...prev, [s.id]: s.status_atual }))}
                      className="text-xs px-2 py-0.5 rounded font-mono hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: `${corDoSetor(s.setor)}20`, color: corDoSetor(s.setor) }}
                    >
                      {s.status_atual}
                    </button>
                  )}
                  {/* Remover setor (não principal) */}
                  {!isPrincipal && onRemoverSetor && (
                    <button
                      type="button"
                      disabled={!!loadingSetorAction}
                      onClick={() => handleRemoverSetorEdit(s.id)}
                      className="p-1 rounded text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {/* Tempo no status atual */}
              {minutos !== null && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-dark-muted font-mono">
                  <Clock className="w-3 h-3" />
                  {minutos < 60 ? `${minutos}min` : `${Math.floor(minutos / 60)}h${minutos % 60 > 0 ? ` ${minutos % 60}min` : ''}`} neste status
                </div>
              )}
            </div>
          )
        })}

        {/* Painel para adicionar setor */}
        <AnimatePresence>
          {adicionandoSetor && setoresDisponiveis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mt-2 p-3 rounded-lg border border-accent/30 bg-accent/5">
                <select
                  className="text-sm bg-dark-surface2 border border-dark-border rounded-lg px-3 py-2 text-onsurface font-body flex-1"
                  value={novoSetor}
                  onChange={e => setNovoSetor(e.target.value)}
                >
                  {setoresDisponiveis.map(s => <option key={s.nome} value={s.nome}>{s.icon} {s.nome}</option>)}
                </select>
                <select
                  className="text-sm bg-dark-surface2 border border-dark-border rounded-lg px-3 py-2 text-onsurface font-mono"
                  value={novoStatus}
                  onChange={e => setNovoStatus(e.target.value)}
                >
                  {etapasDoSetor(novoSetor).map(e => <option key={e.id} value={e.label}>{e.label}</option>)}
                </select>
                <button
                  type="button"
                  disabled={loadingSetorAction === 'add'}
                  onClick={isEdit ? handleAdicionarSetorEdit : adicionarSetorExtra}
                  className="px-3 py-2 rounded-lg bg-accent text-black text-sm font-bold hover:bg-accent-hover transition-all disabled:opacity-50"
                >
                  {loadingSetorAction === 'add' ? '...' : 'Adicionar'}
                </button>
                <button type="button" onClick={() => setAdicionandoSetor(false)} className="p-2 rounded-lg text-dark-muted hover:text-onsurface">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Responsáveis */}
      <div className="border-t border-dark-border pt-4">
        <label className={labelClass}>
          Responsáveis — {form.setor}
          {responsaveisSelecionados.length > 0 && (
            <span className="ml-2 text-accent normal-case font-mono">{responsaveisSelecionados.length} selecionado(s)</span>
          )}
        </label>
        {usuariosDoSetor.length === 0 ? (
          <p className="text-xs text-dark-muted font-body italic">
            Nenhum usuário cadastrado para este setor.{' '}
            <span className="text-accent">Configure em Usuários →</span>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {usuariosDoSetor.map(u => {
              const sel = responsaveisSelecionados.includes(u.id)
              return (
                <button
                  key={u.id} type="button"
                  onClick={() => toggleResponsavel(u.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body border transition-all ${
                    sel
                      ? 'bg-accent/15 text-accent border-accent/30 shadow-sm'
                      : 'text-dark-muted border-dark-border hover:text-onsurface hover:bg-dark-surface2'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${sel ? 'bg-accent/20' : 'bg-dark-surface2'}`}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>{u.nome || u.email}</span>
                  {u.telefone && (
                    <span className="flex items-center gap-0.5 text-xs text-dark-muted">
                      <Phone className="w-3 h-3" />{u.telefone}
                    </span>
                  )}
                  {sel && <X className="w-3.5 h-3.5 ml-1 opacity-60" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Campos extras */}
      {campos.length > 0 && (
        <div className="border-t border-dark-border pt-4 mt-4">
          <p className="text-xs font-display tracking-wider text-dark-muted mb-3">CAMPOS EXTRAS</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campos.map(c => (
              <div key={c.id}>
                <label className={labelClass}>{c.label} {c.obrigatorio && '*'}</label>
                {c.tipo === 'select' ? (
                  <select className={inputClass} value={(form.extras[c.label] as string) || ''} onChange={e => setExtra(c.label, e.target.value)} required={c.obrigatorio}>
                    <option value="">Selecionar...</option>
                    {c.opcoes?.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                ) : (
                  <input type={c.tipo} className={inputClass} value={(form.extras[c.label] as string) || ''} onChange={e => setExtra(c.label, e.target.value)} required={c.obrigatorio} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vinculo */}
      {osDisponiveis.length > 0 && (
        <div className="border-t border-dark-border pt-4">
          <button type="button" onClick={() => setVinculoAberto(v => !v)} className="flex items-center gap-2 text-xs font-body font-semibold text-dark-muted hover:text-accent transition-all">
            <Link2 className="w-3.5 h-3.5" />
            Vincular a OS de outro setor
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${vinculoAberto ? 'rotate-180' : ''}`} />
            {form.vinculo && <span className="text-accent text-xs">(vinculado)</span>}
          </button>
          {vinculoAberto && (
            <div className="mt-2">
              <select className={inputClass + ' w-full'} value={form.vinculo} onChange={e => set('vinculo', e.target.value)}>
                <option value="">Sem vinculo</option>
                {osDisponiveis.map(o => <option key={o.id} value={o.id}>{o.numero} — {o.cliente} ({o.setor})</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Observacoes */}
      <div>
        <label className={labelClass}>Observacoes</label>
        <textarea className={`${inputClass} min-h-[80px] resize-y`} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Detalhes do servico..." />
      </div>

      {/* Historico */}
      {isEdit && (
        <div className="border-t border-dark-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-display tracking-wider text-dark-muted">HISTORICO</p>
            <button type="button" onClick={() => {
              const txt = historico.length
                ? historico.map(h => `[${new Date(h.criado_em).toLocaleString('pt-BR')}] ${h.tipo === 'criacao' ? 'Criado' : h.tipo === 'edicao' ? 'Editado' : `${h.status_anterior} → ${h.status_novo}`}${h.operador ? ` (${h.operador})` : ''}`).join('\n')
                : 'Sem historico'
              navigator.clipboard?.writeText(`OS ${os?.numero}\n${txt}`)
            }} className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-body text-dark-muted hover:text-accent hover:bg-accent/10 border border-dark-border transition-all">
              📋 Copiar
            </button>
          </div>
          {historico.length === 0 ? (
            <p className="text-xs text-dark-muted font-body">Sem registros de historico.</p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {historico.map(h => (
                <div key={h.id} className="flex items-start gap-2 text-xs font-body">
                  <span className="text-dark-muted shrink-0 font-mono">{new Date(h.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-onsurface">
                    {h.tipo === 'criacao' && 'OS criada'}
                    {h.tipo === 'edicao' && 'Dados editados'}
                    {h.tipo === 'status' && <><span className="text-dark-muted">{h.status_anterior}</span> → <span className="text-accent">{h.status_novo}</span></>}
                  </span>
                  {h.operador && <span className="text-dark-muted">· {h.operador}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2 border-t border-dark-border">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-body font-semibold text-dark-muted bg-dark-surface2 border border-dark-border hover:text-onsurface transition-all">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-body font-bold bg-accent text-black hover:bg-accent-hover transition-all disabled:opacity-50 shadow-lg shadow-accent/20">
          {saving ? 'Salvando...' : isEdit ? 'Atualizar OS' : 'Criar OS'}
        </button>
      </div>
    </form>
  )
}
