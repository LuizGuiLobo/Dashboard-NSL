import { motion } from 'framer-motion'
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, TrendingUp, Truck } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { KPICard } from '@/components/dashboard/KPICard'
import { ChartOSporSetor, ChartStatusPizza, ChartEvolucaoMensal, PatioIndicator } from '@/components/dashboard/Charts'
import { KPISkeleton } from '@/components/ui/Skeleton'
import { staggerContainer } from '@/hooks/useAnimations'
import { diasDesdeEntrada } from '@/lib/utils'
import type { OrdemServico, EtapaKanban } from '@/types'

interface DashboardProps {
  ordens: OrdemServico[]
  todasEtapas: EtapaKanban[]
  etapasDoSetor: (setor: string) => EtapaKanban[]
  todasEtapasUnicas: () => EtapaKanban[]
  loading: boolean
}

export function Dashboard({ ordens, todasEtapas, etapasDoSetor, todasEtapasUnicas, loading }: DashboardProps) {
  const total = ordens.length

  // Use all unique labels to detect "final" statuses
  const finalStatuses = new Set<string>()
  const setoresVistos = new Set<string>()
  todasEtapas.forEach(e => {
    if (!setoresVistos.has(e.setor)) {
      setoresVistos.add(e.setor)
    }
  })
  // For each setor, the last etapa is "concluded"
  setoresVistos.forEach(setor => {
    const etapas = etapasDoSetor(setor)
    if (etapas.length > 0) {
      finalStatuses.add(etapas[etapas.length - 1].label)
    }
  })

  const abertas = ordens.filter(o => !finalStatuses.has(o.status)).length
  const aguardando = ordens.filter(o => {
    const s = o.status.toLowerCase()
    return s.includes('aguardando') && s.includes('aprov')
  }).length
  const emAndamento = ordens.filter(o => {
    const s = o.status.toLowerCase()
    return s.includes('serviço') || s.includes('reparo') || s.includes('teste') || s.includes('calibra')
  }).length
  const mes = new Date().getMonth()
  const concluidas = ordens.filter(o => {
    const d = new Date(o.atualizado_em || o.criado_em)
    return finalStatuses.has(o.status) && d.getMonth() === mes
  }).length
  const patio = ordens.filter(o => o.setor === 'Veículo Diesel' && !finalStatuses.has(o.status)).length

  const tempoMedio = ordens.length
    ? Math.round(ordens.reduce((acc, o) => acc + diasDesdeEntrada(o.data_entrada), 0) / ordens.length)
    : 0

  const etapasUnicas = todasEtapasUnicas()

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display tracking-wider text-white">DASHBOARD</h1>
        </div>

        {/* KPIs */}
        {loading ? <KPISkeleton /> : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <KPICard title="Total OS" value={total} icon={ClipboardList} color="#3b82f6" />
            <KPICard title="Abertas" value={abertas} icon={Clock} color="#f59e0b" />
            <KPICard title="Aguardando" value={aguardando} icon={AlertTriangle} color="#ef4444" />
            <KPICard title="Em Andamento" value={emAndamento} icon={TrendingUp} color="#8b5cf6" />
            <KPICard title="Concluidas (Mes)" value={concluidas} icon={CheckCircle2} color="#10b981" />
            <KPICard title="No Patio" value={patio} icon={Truck} color="#ef4444" subtitle={`Tempo medio: ${tempoMedio}d`} />
          </motion.div>
        )}

        {/* Charts */}
        {!loading && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <ChartOSporSetor ordens={ordens} />
            <ChartStatusPizza ordens={ordens} etapas={etapasUnicas} />
            <ChartEvolucaoMensal ordens={ordens} />
          </motion.div>
        )}

        {/* Patio */}
        {!loading && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <PatioIndicator ordens={ordens} />
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
