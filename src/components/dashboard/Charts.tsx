import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import { staggerItem } from '@/hooks/useAnimations'
import type { OrdemServico, EtapaKanban } from '@/types'
import { SETORES, corDoSetor } from '@/lib/constants'

interface ChartsProps {
  ordens: OrdemServico[]
  etapas: EtapaKanban[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-lg shadow-xl"
      style={{
        background: 'rgba(53,53,53,0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(68,70,79,0.3)',
      }}
    >
      <p className="text-xs text-dark-muted font-body mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-mono font-bold" style={{ color: p.color }}>{p.value}</p>
      ))}
    </div>
  )
}

const cardClass = 'bg-dark-surface2 rounded-lg p-5'
const titleClass = 'text-xs font-display font-bold tracking-widest text-onsurface uppercase mb-4'

export function ChartOSporSetor({ ordens }: { ordens: OrdemServico[] }) {
  const data = SETORES.map(s => ({
    setor: s.nome.split(' ').slice(0, 2).join(' '),
    total: ordens.filter(o => o.setor === s.nome).length,
    cor: s.cor,
  }))

  return (
    <motion.div variants={staggerItem} className={cardClass}>
      <h3 className={titleClass}>OS por Setor</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="setor" tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} animationDuration={1200}>
            {data.map((d, i) => <Cell key={i} fill={d.cor} fillOpacity={0.8} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export function ChartStatusPizza({ ordens, etapas }: ChartsProps) {
  const data = etapas.map(e => ({
    name: e.label,
    value: ordens.filter(o => o.status === e.label).length,
    color: e.cor,
  })).filter(d => d.value > 0)

  if (!data.length) {
    return (
      <motion.div variants={staggerItem} className={`${cardClass} flex items-center justify-center h-[310px]`}>
        <p className="text-dark-muted text-sm font-body">Sem dados para exibir</p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={staggerItem} className={cardClass}>
      <h3 className={titleClass}>Por Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            animationDuration={1200}
          >
            {data.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-dark-muted">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function ChartEvolucaoMensal({ ordens }: { ordens: OrdemServico[] }) {
  const hoje = new Date()
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1)
    const mes = d.toLocaleString('pt-BR', { month: 'short' })
    const abertas = ordens.filter(o => {
      const dt = new Date(o.data_entrada)
      return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear()
    }).length
    return { mes, abertas }
  })

  return (
    <motion.div variants={staggerItem} className={cardClass}>
      <h3 className={titleClass}>Evolução Mensal</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={meses}>
          <CartesianGrid stroke="#2A2A2A" strokeDasharray="0" />
          <XAxis dataKey="mes" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="abertas"
            stroke="#FFBA46"
            strokeWidth={2.5}
            dot={{ fill: '#FFBA46', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#FFBA46', stroke: '#FFDDB0', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export function PatioIndicator({ ordens }: { ordens: OrdemServico[] }) {
  const patio = ordens.filter(o => o.setor === 'Veículo Diesel' && o.status !== 'Concluído' && o.status !== 'Entregue')

  return (
    <motion.div variants={staggerItem} className={cardClass}>
      <h3 className={titleClass}>Veículos no Pátio</h3>
      {!patio.length ? (
        <p className="text-dark-muted text-sm font-body py-4 text-center">Nenhum veículo no pátio</p>
      ) : (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {patio.map(o => {
            const dias = Math.floor((Date.now() - new Date(o.data_entrada).getTime()) / 86400000)
            const cor = dias >= 7
              ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : dias >= 4
              ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
              : 'text-green-400 bg-green-500/10 border-green-500/20'
            return (
              <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-dark-surface3">
                <div>
                  <span className="text-sm font-mono text-onsurface">{o.placa || o.numero}</span>
                  <span className="text-xs text-dark-muted ml-2">{o.cliente}</span>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${cor}`}>{dias}d</span>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
