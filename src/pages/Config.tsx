import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Plus, Trash2, Columns3, FormInput, Users, Copy, AlertTriangle } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { staggerContainer, staggerItem } from '@/hooks/useAnimations'
import { SETORES, corDoSetor } from '@/lib/constants'
import type { EtapaKanban, CampoConfig, Operador, OrdemServico } from '@/types'

const CORES_ETAPA = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#64748b', '#ec4899', '#06b6d4', '#f97316', '#84cc16']

interface ConfigProps {
  todasEtapas: EtapaKanban[]
  etapasDoSetor: (setor: string) => EtapaKanban[]
  campos: CampoConfig[]
  operadores: Operador[]
  ordens: OrdemServico[]
  onSalvarEtapasSetor: (setor: string, e: Omit<EtapaKanban, 'id'>[]) => Promise<void>
  onSalvarCampos: (c: Omit<CampoConfig, 'id'>[]) => Promise<void>
  onSalvarOperadores: (o: Omit<Operador, 'id' | 'criado_em'>[]) => Promise<void>
}

export function Config({ todasEtapas, etapasDoSetor, campos, operadores, ordens, onSalvarEtapasSetor, onSalvarCampos, onSalvarOperadores }: ConfigProps) {
  const [aba, setAba] = useState<'etapas' | 'campos' | 'operadores'>('etapas')
  const { toast } = useToast()

  // ==================== ETAPAS ====================
  const [setorEtapas, setSetorEtapas] = useState(SETORES[0].nome)
  const [etapasTemp, setEtapasTemp] = useState<Array<{ label: string; cor: string; ordem: number; etapa_id: string; setor: string }>>([])
  const [savingEtapas, setSavingEtapas] = useState(false)
  const [modalCopiar, setModalCopiar] = useState(false)

  // Load etapas when setor changes
  useEffect(() => {
    const etapas = etapasDoSetor(setorEtapas)
    setEtapasTemp(etapas.map((e, i) => ({
      label: e.label,
      cor: e.cor,
      ordem: i + 1,
      etapa_id: e.etapa_id || `etapa_${i}`,
      setor: setorEtapas,
    })))
  }, [setorEtapas, todasEtapas, etapasDoSetor])

  // Count OS per etapa for the current setor
  const osCountByEtapa = useMemo(() => {
    const counts: Record<string, number> = {}
    const osDoSetor = ordens.filter(o => o.setor === setorEtapas)
    etapasTemp.forEach(e => {
      counts[e.label] = osDoSetor.filter(o => o.status === e.label).length
    })
    return counts
  }, [ordens, setorEtapas, etapasTemp])

  // Drag etapas
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const handleDragStart = (i: number) => setDragIdx(i)
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) return
    setEtapasTemp(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(i, 0, moved)
      return next
    })
    setDragIdx(i)
  }
  const handleDragEnd = () => setDragIdx(null)

  const salvarEtapas = async () => {
    setSavingEtapas(true)
    try {
      await onSalvarEtapasSetor(
        setorEtapas,
        etapasTemp.map((e, i) => ({ label: e.label, cor: e.cor, ordem: i + 1, etapa_id: e.etapa_id, setor: setorEtapas }))
      )
      toast(`Etapas de "${setorEtapas}" salvas!`)
    } catch (e: any) { toast(e.message, 'error') }
    setSavingEtapas(false)
  }

  const excluirEtapa = (i: number) => {
    const label = etapasTemp[i].label
    const count = osCountByEtapa[label] || 0
    if (count > 0) {
      toast(`Existem ${count} OS na etapa "${label}". Mova-as antes de excluir.`, 'error')
      return
    }
    setEtapasTemp(prev => prev.filter((_, j) => j !== i))
  }

  const copiarDeSetor = (setorOrigem: string) => {
    const etapasOrigem = etapasDoSetor(setorOrigem)
    setEtapasTemp(etapasOrigem.map((e, i) => ({
      label: e.label,
      cor: e.cor,
      ordem: i + 1,
      etapa_id: `etapa_${Date.now()}_${i}`,
      setor: setorEtapas,
    })))
    setModalCopiar(false)
    toast(`Etapas copiadas de "${setorOrigem}". Clique em Salvar para confirmar.`, 'info')
  }

  // ==================== CAMPOS ====================
  const [camposTemp, setCamposTemp] = useState<Array<{ label: string; tipo: string; opcoes: string[]; obrigatorio: boolean; campo_id: string; ordem: number }>>([])
  const [savingCampos, setSavingCampos] = useState(false)

  useEffect(() => {
    setCamposTemp(campos.map((c, i) => ({ label: c.label, tipo: c.tipo, opcoes: c.opcoes || [], obrigatorio: c.obrigatorio, campo_id: c.campo_id || `campo_${i}`, ordem: i })))
  }, [campos])

  const salvarCampos = async () => {
    setSavingCampos(true)
    try {
      await onSalvarCampos(camposTemp.map((c, i) => ({ label: c.label, tipo: c.tipo, opcoes: c.opcoes, obrigatorio: c.obrigatorio, campo_id: c.campo_id, ordem: i })) as any)
      toast('Campos salvos!')
    } catch (e: any) { toast(e.message, 'error') }
    setSavingCampos(false)
  }

  // ==================== OPERADORES ====================
  const [opsTemp, setOpsTemp] = useState<Array<{ nome: string; setor: string; ativo: boolean }>>([])
  const [savingOps, setSavingOps] = useState(false)

  useEffect(() => {
    setOpsTemp(operadores.map(o => ({ nome: o.nome, setor: o.setor, ativo: o.ativo })))
  }, [operadores])

  const salvarOps = async () => {
    setSavingOps(true)
    try {
      await onSalvarOperadores(opsTemp)
      toast('Operadores salvos!')
    } catch (e: any) { toast(e.message, 'error') }
    setSavingOps(false)
  }

  const inputClass = 'bg-dark-surface2 border border-dark-border rounded-lg px-3 py-2 text-sm text-white font-body placeholder-dark-muted focus:outline-none focus:border-accent transition-all'
  const btnSave = 'px-5 py-2.5 rounded-xl bg-accent text-black font-body font-bold text-sm hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 disabled:opacity-50'

  const abas = [
    { key: 'etapas' as const, label: 'Etapas do Kanban', icon: Columns3 },
    { key: 'campos' as const, label: 'Campos do Formulario', icon: FormInput },
    { key: 'operadores' as const, label: 'Operadores', icon: Users },
  ]

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-3xl font-display tracking-wider text-white">CONFIGURACOES</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-dark-border pb-3">
          {abas.map(a => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all ${
                aba === a.key ? 'bg-accent/15 text-accent border border-accent/30' : 'text-dark-muted hover:text-white border border-transparent'
              }`}
            >
              <a.icon className="w-4 h-4" /> {a.label}
            </button>
          ))}
        </div>

        {/* ==================== ETAPAS ==================== */}
        {aba === 'etapas' && (
          <motion.div className="space-y-4" variants={staggerContainer} initial="hidden" animate="visible">
            {/* Setor selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {SETORES.map(s => {
                const active = setorEtapas === s.nome
                const count = etapasDoSetor(s.nome).length
                return (
                  <button
                    key={s.nome}
                    onClick={() => setSetorEtapas(s.nome)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-semibold whitespace-nowrap transition-all duration-200 border ${
                      active ? 'text-white shadow-lg' : 'text-dark-muted bg-dark-surface2 border-dark-border hover:text-white'
                    }`}
                    style={active ? {
                      backgroundColor: `${s.cor}20`,
                      borderColor: `${s.cor}50`,
                      color: s.cor,
                      boxShadow: `0 4px 20px ${s.cor}15`,
                    } : undefined}
                  >
                    {s.icon} {s.nome.split(' ').slice(0, 2).join(' ')}
                    <span className="text-xs font-mono opacity-70">{count}</span>
                  </button>
                )
              })}
            </div>

            <div className="bg-dark-surface border border-dark-border rounded-xl p-4 text-sm text-dark-muted font-body flex items-center gap-2">
              💡 Cada setor tem suas proprias etapas. Arraste para reordenar. O numero indica OS ativas naquela etapa.
            </div>

            {/* Etapas list */}
            <AnimatePresence mode="wait">
              <motion.div
                key={setorEtapas}
                className="space-y-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {etapasTemp.map((e, i) => {
                  const osCount = osCountByEtapa[e.label] || 0
                  return (
                    <motion.div
                      key={e.etapa_id + i}
                      variants={staggerItem}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={ev => handleDragOver(ev, i)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 bg-dark-surface border rounded-xl px-4 py-3 transition-all group ${
                        dragIdx === i ? 'opacity-50 border-accent scale-[0.98]' : 'border-dark-border'
                      }`}
                      style={{ borderLeftWidth: 3, borderLeftColor: e.cor }}
                      whileHover={{ scale: 1.005 }}
                    >
                      <GripVertical className="w-4 h-4 text-dark-muted cursor-grab active:cursor-grabbing flex-shrink-0" />
                      <span className="text-xs font-mono text-dark-muted w-5 text-center flex-shrink-0">{i + 1}</span>
                      <input
                        className={`${inputClass} flex-1`}
                        value={e.label}
                        onChange={ev => setEtapasTemp(prev => prev.map((x, j) => j === i ? { ...x, label: ev.target.value } : x))}
                      />
                      <div className="flex gap-1.5 flex-shrink-0">
                        {CORES_ETAPA.map(c => (
                          <button
                            key={c}
                            onClick={() => setEtapasTemp(prev => prev.map((x, j) => j === i ? { ...x, cor: c } : x))}
                            className="w-5 h-5 rounded-full transition-all hover:scale-110"
                            style={{ backgroundColor: c, border: e.cor === c ? '2px solid white' : '2px solid transparent' }}
                          />
                        ))}
                      </div>
                      {/* OS count badge */}
                      {osCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-mono font-bold border border-yellow-500/20 flex-shrink-0">
                          <AlertTriangle className="w-3 h-3" /> {osCount}
                        </span>
                      )}
                      <button
                        onClick={() => excluirEtapa(i)}
                        className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                          osCount > 0
                            ? 'text-dark-muted/30 cursor-not-allowed'
                            : 'text-dark-muted hover:text-red-400 hover:bg-red-500/10'
                        }`}
                        title={osCount > 0 ? `${osCount} OS nesta etapa` : 'Excluir etapa'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEtapasTemp(prev => [...prev, {
                    label: 'Nova Etapa',
                    cor: '#64748b',
                    ordem: prev.length + 1,
                    etapa_id: `etapa_${Date.now()}`,
                    setor: setorEtapas,
                  }])
                  // Focus the new input after render
                  setTimeout(() => {
                    const inputs = document.querySelectorAll<HTMLInputElement>('.space-y-3 input[type="text"], .space-y-3 input:not([type])')
                    if (inputs.length) inputs[inputs.length - 1].focus()
                  }, 50)
                }}
                className="flex-1 py-2.5 rounded-xl border border-dashed border-dark-border text-sm font-body text-dark-muted hover:text-accent hover:border-accent/30 transition-all"
              >
                <Plus className="w-4 h-4 inline mr-1" /> Adicionar etapa
              </button>
              <button
                onClick={() => setModalCopiar(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dark-border text-sm font-body text-dark-muted hover:text-accent hover:border-accent/30 transition-all"
              >
                <Copy className="w-4 h-4" /> Copiar de outro setor
              </button>
            </div>

            <div className="flex justify-end">
              <button onClick={salvarEtapas} disabled={savingEtapas} className={btnSave}>
                {savingEtapas ? 'Salvando...' : `💾 Salvar Etapas — ${setorEtapas}`}
              </button>
            </div>

            {/* Modal copiar etapas */}
            <Modal open={modalCopiar} onClose={() => setModalCopiar(false)} title="Copiar etapas de outro setor" size="sm">
              <div className="space-y-2">
                <p className="text-sm text-dark-muted font-body mb-4">
                  Selecione o setor de origem. As etapas serao copiadas para <strong className="text-white">{setorEtapas}</strong>.
                </p>
                {SETORES.filter(s => s.nome !== setorEtapas).map(s => {
                  const count = etapasDoSetor(s.nome).length
                  return (
                    <button
                      key={s.nome}
                      onClick={() => copiarDeSetor(s.nome)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-dark-surface2 border border-dark-border hover:border-accent/30 hover:bg-dark-surface transition-all text-left"
                    >
                      <span className="flex items-center gap-2 font-body text-sm text-white">
                        <span style={{ color: s.cor }}>{s.icon}</span> {s.nome}
                      </span>
                      <span className="text-xs font-mono text-dark-muted">{count} etapas</span>
                    </button>
                  )
                })}
              </div>
            </Modal>
          </motion.div>
        )}

        {/* ==================== CAMPOS ==================== */}
        {aba === 'campos' && (
          <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
            <div className="bg-dark-surface border border-dark-border rounded-xl p-4 text-sm text-dark-muted font-body flex items-center gap-2">
              💡 Campos extras aparecem no formulario de nova OS.
            </div>
            {camposTemp.map((c, i) => (
              <motion.div key={c.campo_id + i} variants={staggerItem} className="flex items-center gap-3 bg-dark-surface border border-dark-border rounded-xl px-4 py-3">
                <input
                  className={`${inputClass} flex-1`}
                  value={c.label}
                  placeholder="Nome do campo"
                  onChange={ev => setCamposTemp(prev => prev.map((x, j) => j === i ? { ...x, label: ev.target.value } : x))}
                />
                <select
                  className={inputClass}
                  value={c.tipo}
                  onChange={ev => setCamposTemp(prev => prev.map((x, j) => j === i ? { ...x, tipo: ev.target.value } : x))}
                >
                  <option value="text">Texto</option>
                  <option value="number">Numero</option>
                  <option value="date">Data</option>
                  <option value="select">Lista</option>
                </select>
                {c.tipo === 'select' && (
                  <input
                    className={`${inputClass} flex-1`}
                    value={(c.opcoes || []).join(', ')}
                    placeholder="Op1, Op2, Op3..."
                    onChange={ev => setCamposTemp(prev => prev.map((x, j) => j === i ? { ...x, opcoes: ev.target.value.split(',').map(s => s.trim()).filter(Boolean) } : x))}
                  />
                )}
                <button
                  onClick={() => setCamposTemp(prev => prev.map((x, j) => j === i ? { ...x, obrigatorio: !x.obrigatorio } : x))}
                  className={`px-3 py-1 rounded-lg text-xs font-body font-bold transition-all ${
                    c.obrigatorio ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-dark-surface2 text-dark-muted border border-dark-border'
                  }`}
                >
                  {c.obrigatorio ? '★ Obrig.' : '☆ Opc.'}
                </button>
                <button onClick={() => setCamposTemp(prev => prev.filter((_, j) => j !== i))} className="p-1.5 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
            <button
              onClick={() => setCamposTemp(prev => [...prev, { label: 'Novo Campo', tipo: 'text', opcoes: [], obrigatorio: false, campo_id: `campo_${Date.now()}`, ordem: prev.length }])}
              className="w-full py-2.5 rounded-xl border border-dashed border-dark-border text-sm font-body text-dark-muted hover:text-accent hover:border-accent/30 transition-all"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Adicionar campo
            </button>
            <div className="flex justify-end">
              <button onClick={salvarCampos} disabled={savingCampos} className={btnSave}>
                {savingCampos ? 'Salvando...' : '💾 Salvar Campos'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ==================== OPERADORES ==================== */}
        {aba === 'operadores' && (
          <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
            <div className="bg-dark-surface border border-dark-border rounded-xl p-4 text-sm text-dark-muted font-body flex items-center gap-2">
              💡 Operadores aparecem no formulario de OS filtrados por setor.
            </div>
            {opsTemp.map((op, i) => (
              <motion.div key={i} variants={staggerItem} className="flex items-center gap-3 bg-dark-surface border border-dark-border rounded-xl px-4 py-3">
                <input
                  className={`${inputClass} flex-1`}
                  value={op.nome}
                  placeholder="Nome do operador"
                  onChange={ev => setOpsTemp(prev => prev.map((x, j) => j === i ? { ...x, nome: ev.target.value } : x))}
                />
                <select
                  className={inputClass}
                  value={op.setor}
                  onChange={ev => setOpsTemp(prev => prev.map((x, j) => j === i ? { ...x, setor: ev.target.value } : x))}
                >
                  {SETORES.map(s => <option key={s.nome} value={s.nome}>{s.nome}</option>)}
                </select>
                <button
                  onClick={() => setOpsTemp(prev => prev.map((x, j) => j === i ? { ...x, ativo: !x.ativo } : x))}
                  className={`px-3 py-1 rounded-lg text-xs font-body font-bold transition-all ${
                    op.ativo ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-dark-surface2 text-dark-muted border border-dark-border'
                  }`}
                >
                  {op.ativo ? '✓ Ativo' : '✗ Inativo'}
                </button>
                <button onClick={() => setOpsTemp(prev => prev.filter((_, j) => j !== i))} className="p-1.5 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
            <button
              onClick={() => setOpsTemp(prev => [...prev, { nome: 'Novo Operador', setor: SETORES[0].nome, ativo: true }])}
              className="w-full py-2.5 rounded-xl border border-dashed border-dark-border text-sm font-body text-dark-muted hover:text-accent hover:border-accent/30 transition-all"
            >
              <Plus className="w-4 h-4 inline mr-1" /> Adicionar operador
            </button>
            <div className="flex justify-end">
              <button onClick={salvarOps} disabled={savingOps} className={btnSave}>
                {savingOps ? 'Salvando...' : '💾 Salvar Operadores'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
