import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, ChevronDown, Phone, User, X } from 'lucide-react'
import { SETORES, TIPOS_OS } from '@/lib/constants'
import { gerarNumeroOS } from '@/lib/utils'
import { useHistorico, useResponsaveis } from '@/hooks/useSupabase'
import type { OrdemServico, EtapaKanban, CampoConfig, Operador, Profile } from '@/types'

interface OSFormProps {
  os?: OrdemServico | null
  etapasDoSetor: (setor: string) => EtapaKanban[]
  campos: CampoConfig[]
  operadores: Operador[]
  profiles: Profile[]
  ordens: OrdemServico[]
  onSave: (data: Partial<OrdemServico>, vinculoId?: string, responsaveisIds?: string[]) => void
  onCancel: () => void
  saving?: boolean
}

export function OSForm({ os, etapasDoSetor, campos, operadores, profiles, ordens, onSave, onCancel, saving }: OSFormProps) {
  const isEdit = !!os
  const submittingRef = useRef(false)
  const [vinculoAberto, setVinculoAberto] = useState(false)
  const { historico } = useHistorico(os?.id || null)
  const { responsaveis: responsaveisSalvos, definir: definirResponsaveis } = useResponsaveis(os?.id || null)

  const [form, setForm] = useState({
    numero: os?.numero || gerarNumeroOS(),
    tipo: os?.tipo || 'Veículo',
    placa: os?.placa || '',
    cliente: os?.cliente || '',
    modelo: os?.modelo || '',
    setor: os?.setor || SETORES[0].nome,
    status: os?.status || '',
    operador: os?.operador || '',
    data_entrada: os?.data_entrada ? os.data_entrada.slice(0, 16) : new Date().toISOString().slice(0, 16),
    observacoes: os?.observacoes || '',
    extras: (os?.extras || {}) as Record<string, string>,
    vinculo: '',
  })

  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState<string[]>([])

  // Inicializar responsáveis ao editar
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

  // Usuários ativos do setor selecionado
  const usuariosDoSetor = useMemo(
    () => profiles.filter(p => p.ativo && p.setores?.includes(form.setor)),
    [profiles, form.setor]
  )

  // Operadores (legado) do setor
  const operadoresDoSetor = operadores.filter(o => o.setores?.includes(form.setor) && o.ativo !== false)

  const osDisponiveis = ordens.filter(o => o.id !== os?.id && o.setor !== form.setor)

  const set = (field: string, value: string) => {
    if (field === 'setor' && !isEdit) {
      const novasEtapas = etapasDoSetor(value)
      setForm(prev => ({
        ...prev, setor: value,
        status: novasEtapas.length > 0 ? novasEtapas[0].label : '',
        operador: '',
      }))
      setResponsaveisSelecionados([]) // limpar responsáveis ao trocar setor
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cliente.trim()) return
    if (submittingRef.current) return
    submittingRef.current = true
    const { vinculo, ...data } = form
    onSave(data, vinculo || undefined, responsaveisSelecionados)
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
          <label className={labelClass}>Setor</label>
          <select className={inputClass} value={form.setor} onChange={e => set('setor', e.target.value)}>
            {SETORES.map(s => <option key={s.nome} value={s.nome}>{s.icon} {s.nome}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Status / Etapa</label>
          <AnimatePresence mode="wait">
            <motion.div key={form.setor} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}>
              {statusDesconhecido && (
                <p className="text-xs text-yellow-400 mb-1 font-body">⚠️ Status "{form.status}" nao existe neste setor.</p>
              )}
              <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value)}>
                {statusDesconhecido && <option value={form.status}>⚠️ {form.status} (desconhecido)</option>}
                {etapasAtuais.map(e => <option key={e.id} value={e.label}>{e.label}</option>)}
                {etapasAtuais.length === 0 && <option value="">Nenhuma etapa configurada</option>}
              </select>
            </motion.div>
          </AnimatePresence>
        </div>
        <div>
          <label className={labelClass}>Data de Entrada</label>
          <input type="datetime-local" className={inputClass} value={form.data_entrada} onChange={e => set('data_entrada', e.target.value)} />
        </div>
      </div>

      {/* Responsáveis — usuários do setor */}
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

        {/* Operador legado (texto livre) — exibido como campo secundário */}
        {operadoresDoSetor.length > 0 && (
          <div className="mt-3">
            <label className={labelClass + ' text-[10px] opacity-70'}>Mecânico (legado)</label>
            <input
              list={`ops-${form.setor}`}
              className={inputClass}
              value={form.operador}
              onChange={e => set('operador', e.target.value)}
              placeholder="Selecionar ou digitar..."
              autoComplete="off"
            />
            <datalist id={`ops-${form.setor}`}>
              {operadoresDoSetor.map(o => <option key={o.id} value={o.nome.trim()} />)}
            </datalist>
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
