import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PageTransition } from '@/components/layout/PageTransition'
import { staggerContainer, staggerItem } from '@/hooks/useAnimations'
import { SETORES, corDoSetor } from '@/lib/constants'
import { diasDesdeEntrada } from '@/lib/utils'
import type { OrdemServico, EtapaKanban } from '@/types'

interface MatrizesProps {
  ordens: OrdemServico[]
  todasEtapas: EtapaKanban[]
  etapasDoSetor: (setor: string) => EtapaKanban[]
}

export function Matrizes({ ordens, todasEtapas, etapasDoSetor }: MatrizesProps) {
  // Matriz tempo x setor
  const tempoSetor = useMemo(() => {
    return SETORES.map(s => {
      const osSetor = ordens.filter(o => o.setor === s.nome)
      const media = osSetor.length
        ? Math.round(osSetor.reduce((a, o) => a + diasDesdeEntrada(o.data_entrada), 0) / osSetor.length)
        : 0
      return { setor: s.nome.split(' ').slice(0, 2).join(' '), media, cor: s.cor, total: osSetor.length }
    })
  }, [ordens])

  // Gargalos por etapa — use unique labels across all setores
  const gargalos = useMemo(() => {
    const seen = new Set<string>()
    const etapasUnicas = todasEtapas.filter(e => {
      if (seen.has(e.label)) return false
      seen.add(e.label)
      return true
    })
    return etapasUnicas.map(e => ({
      etapa: e.label,
      cor: e.cor,
      count: ordens.filter(o => o.status === e.label).length,
    })).sort((a, b) => b.count - a.count)
  }, [ordens, todasEtapas])

  // Eficiencia por operador
  const eficiencia = useMemo(() => {
    const ops: Record<string, { total: number; tempoTotal: number }> = {}
    ordens.forEach(o => {
      if (!o.operador) return
      if (!ops[o.operador]) ops[o.operador] = { total: 0, tempoTotal: 0 }
      ops[o.operador].total++
      ops[o.operador].tempoTotal += diasDesdeEntrada(o.data_entrada)
    })
    return Object.entries(ops).map(([nome, d]) => ({
      nome,
      total: d.total,
      media: d.total ? Math.round(d.tempoTotal / d.total) : 0,
    })).sort((a, b) => b.total - a.total)
  }, [ordens])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-dark-surface2 border border-dark-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-dark-muted font-body">{label}</p>
        <p className="text-sm font-mono font-bold text-accent">{payload[0].value}</p>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-3xl font-display tracking-wider text-white">MATRIZES DE ANALISE</h1>

        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={staggerContainer} initial="hidden" animate="visible">
          {/* Tempo medio por setor */}
          <motion.div variants={staggerItem} className="bg-dark-surface border border-dark-border rounded-xl p-5">
            <h3 className="text-sm font-display tracking-wider text-white mb-4">TEMPO MEDIO POR SETOR (DIAS)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tempoSetor} layout="vertical">
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="setor" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="media" radius={[0, 6, 6, 0]} animationDuration={1200}>
                  {tempoSetor.map((d, i) => <Cell key={i} fill={d.cor} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Gargalos (Pareto) */}
          <motion.div variants={staggerItem} className="bg-dark-surface border border-dark-border rounded-xl p-5">
            <h3 className="text-sm font-display tracking-wider text-white mb-4">GARGALOS POR ETAPA</h3>
            <div className="space-y-3">
              {gargalos.map((g, i) => {
                const max = Math.max(...gargalos.map(x => x.count), 1)
                const pct = (g.count / max) * 100
                return (
                  <div key={g.etapa} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-body text-white/80">{g.etapa}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: g.cor }}>{g.count}</span>
                    </div>
                    <div className="h-2 bg-dark-surface2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: g.cor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Eficiencia por operador */}
          <motion.div variants={staggerItem} className="bg-dark-surface border border-dark-border rounded-xl p-5 lg:col-span-2">
            <h3 className="text-sm font-display tracking-wider text-white mb-4">EFICIENCIA POR OPERADOR</h3>
            {eficiencia.length === 0 ? (
              <p className="text-dark-muted text-sm font-body py-4 text-center">Nenhum operador com OS atribuida</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-dark-border">
                      <th className="px-4 py-3 text-xs font-body font-semibold text-dark-muted uppercase">Operador</th>
                      <th className="px-4 py-3 text-xs font-body font-semibold text-dark-muted uppercase">OS Total</th>
                      <th className="px-4 py-3 text-xs font-body font-semibold text-dark-muted uppercase">Tempo Medio</th>
                      <th className="px-4 py-3 text-xs font-body font-semibold text-dark-muted uppercase">Carga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eficiencia.map(op => {
                      const max = Math.max(...eficiencia.map(x => x.total), 1)
                      return (
                        <tr key={op.nome} className="border-t border-dark-border/50 hover:bg-dark-surface2/50 transition-colors">
                          <td className="px-4 py-3 text-white font-body font-semibold">{op.nome}</td>
                          <td className="px-4 py-3 font-mono text-accent font-bold">{op.total}</td>
                          <td className="px-4 py-3 font-mono text-dark-muted">{op.media}d</td>
                          <td className="px-4 py-3">
                            <div className="h-2 bg-dark-surface2 rounded-full overflow-hidden w-32">
                              <div className="h-full rounded-full bg-accent" style={{ width: `${(op.total / max) * 100}%` }} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
