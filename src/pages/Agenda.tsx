import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalIcon, List, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { staggerContainer, staggerItem, modalVariants, backdropVariants } from '@/hooks/useAnimations'
import { REUNIOES } from '@/lib/constants'
import { Badge } from '@/components/ui/Badge'
import type { Reuniao } from '@/types'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const DIA_MAP: Record<string, number> = { 'Domingo': 0, 'Segunda': 1, 'Terca': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sabado': 6 }

function getUltimoDiaUtilDoMes(year: number, month: number) {
  let d = new Date(year, month + 1, 0)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1)
  return d.getDate()
}

export function Agenda() {
  const [view, setView] = useState<'calendario' | 'lista'>('calendario')
  const [detalhes, setDetalhes] = useState<Reuniao | null>(null)
  const [mesOffset, setMesOffset] = useState(0)

  const hoje = new Date()
  const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + mesOffset, 1)
  const nomeMes = mesAtual.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  const diasNoMes = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate()
  const primeiroDia = mesAtual.getDay()
  const ultimoDiaUtil = getUltimoDiaUtilDoMes(mesAtual.getFullYear(), mesAtual.getMonth())

  const reunioesNoDia = (dia: number): Reuniao[] => {
    const date = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia)
    const diaSemana = date.getDay()
    return REUNIOES.filter(r => {
      if (r.dia === 'Último dia útil') return dia === ultimoDiaUtil
      return DIA_MAP[r.dia] === diaSemana
    })
  }

  const cores = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display tracking-wider text-white">AGENDA</h1>
          <div className="flex gap-1 bg-dark-surface2 rounded-xl p-1 border border-dark-border">
            <button
              onClick={() => setView('calendario')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body font-semibold transition-all ${view === 'calendario' ? 'bg-accent text-black' : 'text-dark-muted hover:text-white'}`}
            >
              <CalIcon className="w-4 h-4" /> Calendario
            </button>
            <button
              onClick={() => setView('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body font-semibold transition-all ${view === 'lista' ? 'bg-accent text-black' : 'text-dark-muted hover:text-white'}`}
            >
              <List className="w-4 h-4" /> Lista
            </button>
          </div>
        </div>

        {view === 'calendario' ? (
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
            {/* Nav mes */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setMesOffset(m => m - 1)} className="p-2 rounded-lg hover:bg-dark-surface2 text-dark-muted hover:text-white transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-display tracking-wider text-white capitalize">{nomeMes}</h2>
              <button onClick={() => setMesOffset(m => m + 1)} className="p-2 rounded-lg hover:bg-dark-surface2 text-dark-muted hover:text-white transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Header dias */}
            <div className="grid grid-cols-7 mb-2">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-xs font-body font-semibold text-dark-muted py-2">{d}</div>
              ))}
            </div>

            {/* Grid dias */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: primeiroDia }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: diasNoMes }, (_, i) => {
                const dia = i + 1
                const rs = reunioesNoDia(dia)
                const isHoje = dia === hoje.getDate() && mesOffset === 0
                return (
                  <div
                    key={dia}
                    className={`min-h-[80px] p-1.5 rounded-lg border transition-all ${
                      isHoje ? 'border-accent/40 bg-accent/5' : 'border-dark-border/50 hover:border-dark-muted/30'
                    }`}
                  >
                    <span className={`text-xs font-mono font-bold ${isHoje ? 'text-accent' : 'text-dark-muted'}`}>{dia}</span>
                    <div className="mt-1 space-y-0.5">
                      {rs.map((r, j) => (
                        <button
                          key={r.id}
                          onClick={() => setDetalhes(r)}
                          className="w-full text-left px-1.5 py-0.5 rounded text-[9px] font-body font-semibold truncate transition-all hover:opacity-80"
                          style={{ backgroundColor: `${cores[j % cores.length]}20`, color: cores[j % cores.length] }}
                        >
                          {r.hora} {r.titulo.split('—')[0].trim().slice(0, 15)}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
            {REUNIOES.map((r, i) => (
              <motion.div
                key={r.id}
                variants={staggerItem}
                onClick={() => setDetalhes(r)}
                className="bg-dark-surface border border-dark-border rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-dark-muted/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cores[i % cores.length]}15`, color: cores[i % cores.length] }}>
                  <CalIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-body font-bold text-white group-hover:text-accent transition-colors">{r.titulo}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-dark-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.dia} {r.hora} ({r.duracao})</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.participantes.length} participantes</span>
                  </div>
                </div>
                <Badge color={r.recorrencia === 'semanal' ? '#3b82f6' : '#f59e0b'}>{r.recorrencia}</Badge>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal detalhes */}
        <AnimatePresence>
          {detalhes && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" variants={backdropVariants} initial="hidden" animate="visible" exit="exit">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetalhes(null)} />
              <motion.div className="relative bg-dark-surface border border-dark-border rounded-2xl p-6 max-w-md w-full shadow-2xl" variants={modalVariants} initial="hidden" animate="visible" exit="exit">
                <h2 className="text-xl font-display tracking-wider text-white mb-4">{detalhes.titulo}</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-dark-muted"><Clock className="w-4 h-4" /> {detalhes.dia} as {detalhes.hora} — {detalhes.duracao}</div>
                  <div>
                    <p className="text-xs font-body font-semibold text-dark-muted uppercase tracking-wider mb-2">Participantes</p>
                    <div className="flex flex-wrap gap-2">
                      {detalhes.participantes.map(p => <Badge key={p} color="#3b82f6">{p}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-body font-semibold text-dark-muted uppercase tracking-wider mb-2">Pauta</p>
                    <ul className="space-y-1">
                      {detalhes.pauta.map((p, i) => (
                        <li key={i} className="text-sm text-white/80 font-body flex items-start gap-2">
                          <span className="text-accent mt-0.5">•</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button onClick={() => setDetalhes(null)} className="mt-6 w-full py-2.5 rounded-xl bg-dark-surface2 text-sm font-body font-semibold text-dark-muted hover:text-white border border-dark-border transition-all">Fechar</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
