import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { staggerContainer, staggerItem } from '@/hooks/useAnimations'
import { corDoSetor } from '@/lib/constants'
import { diasDesdeEntrada, badgeDias, formatarData } from '@/lib/utils'
import { SETORES } from '@/lib/constants'
import type { OrdemServico, EtapaKanban } from '@/types'

interface OSTableProps {
  ordens: OrdemServico[]
  etapas: EtapaKanban[]
  loading: boolean
  onEdit: (os: OrdemServico) => void
  onDelete: (id: string) => void
}

type SortKey = 'numero' | 'cliente' | 'setor' | 'status' | 'data_entrada' | 'dias'
type SortDir = 'asc' | 'desc'

export function OSTable({ ordens, etapas, loading, onEdit, onDelete }: OSTableProps) {
  const [busca, setBusca] = useState('')
  const [filtroSetor, setFiltroSetor] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('data_entrada')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [pagina, setPagina] = useState(0)
  const porPagina = 20

  const filtradas = useMemo(() => {
    let list = [...ordens]
    if (busca) {
      const q = busca.toLowerCase()
      list = list.filter(o =>
        o.numero.toLowerCase().includes(q) ||
        o.placa?.toLowerCase().includes(q) ||
        o.cliente.toLowerCase().includes(q)
      )
    }
    if (filtroSetor) list = list.filter(o => o.setor === filtroSetor)
    if (filtroStatus) list = list.filter(o => o.status === filtroStatus)

    list.sort((a, b) => {
      let va: any, vb: any
      if (sortKey === 'dias') {
        va = diasDesdeEntrada(a.data_entrada)
        vb = diasDesdeEntrada(b.data_entrada)
      } else {
        va = (a as any)[sortKey] || ''
        vb = (b as any)[sortKey] || ''
      }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase() }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [ordens, busca, filtroSetor, filtroStatus, sortKey, sortDir])

  const paginadas = filtradas.slice(pagina * porPagina, (pagina + 1) * porPagina)
  const totalPaginas = Math.ceil(filtradas.length / porPagina)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const exportCSV = () => {
    const header = 'Numero;Placa;Cliente;Modelo;Setor;Status;Data Entrada;Operador;Observacoes\n'
    const rows = filtradas.map(o =>
      `${o.numero};${o.placa};${o.cliente};${o.modelo};${o.setor};${o.status};${formatarData(o.data_entrada)};${o.operador};${o.observacoes?.replace(/;/g, ',')}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `ordens_servico_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />
  }

  const inputClass = 'bg-dark-surface2 border border-dark-border rounded-lg px-3 py-2 text-sm text-white font-body placeholder-dark-muted focus:outline-none focus:border-accent transition-all'

  if (loading) return <TableSkeleton rows={8} />

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
          <input className={`${inputClass} pl-9 w-full`} placeholder="Buscar por placa, cliente, numero..." value={busca} onChange={e => { setBusca(e.target.value); setPagina(0) }} />
        </div>
        <select className={inputClass} value={filtroSetor} onChange={e => { setFiltroSetor(e.target.value); setPagina(0) }}>
          <option value="">Todos os setores</option>
          {SETORES.map(s => <option key={s.nome} value={s.nome}>{s.nome}</option>)}
        </select>
        <select className={inputClass} value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPagina(0) }}>
          <option value="">Todos os status</option>
          {etapas.map(e => <option key={e.label} value={e.label}>{e.label}</option>)}
        </select>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-surface2 border border-dark-border text-sm text-dark-muted hover:text-accent transition-all">
          <Download className="w-4 h-4" /> CSV
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-xl border border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-dark-surface2 text-left">
              {[
                { key: 'numero' as SortKey, label: 'OS' },
                { key: 'cliente' as SortKey, label: 'Cliente' },
                { key: 'setor' as SortKey, label: 'Setor' },
                { key: 'status' as SortKey, label: 'Status' },
                { key: 'dias' as SortKey, label: 'Dias' },
                { key: 'data_entrada' as SortKey, label: 'Entrada' },
              ].map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)} className="px-4 py-3 font-body font-semibold text-xs text-dark-muted uppercase tracking-wider cursor-pointer hover:text-white transition-colors">
                  {col.label} <SortIcon col={col.key} />
                </th>
              ))}
              <th className="px-4 py-3 text-xs text-dark-muted">Acoes</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
            {paginadas.map(o => {
              const dias = diasDesdeEntrada(o.data_entrada)
              const ds = badgeDias(dias)
              const etapa = etapas.find(e => e.label === o.status)
              return (
                <motion.tr key={o.id} variants={staggerItem} className="border-t border-dark-border hover:bg-dark-surface2/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-accent font-bold">{o.numero}</td>
                  <td className="px-4 py-3 text-white font-body">
                    {o.cliente}
                    {o.placa && <span className="text-dark-muted text-xs ml-2 font-mono">{o.placa}</span>}
                  </td>
                  <td className="px-4 py-3"><Badge color={corDoSetor(o.setor)}>{o.setor}</Badge></td>
                  <td className="px-4 py-3"><Badge color={etapa?.cor || '#64748b'}>{o.status}</Badge></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${ds.bg} ${ds.cor}`}>{dias}d</span>
                  </td>
                  <td className="px-4 py-3 text-dark-muted text-xs font-mono">{formatarData(o.data_entrada)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(o)} className="p-1.5 rounded-lg text-dark-muted hover:text-accent hover:bg-accent/10 transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(o.id)} className="p-1.5 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </table>
      </div>

      {/* Paginacao */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-dark-muted font-body">{filtradas.length} ordens encontradas</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => setPagina(i)}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                  pagina === i ? 'bg-accent text-black' : 'bg-dark-surface2 text-dark-muted hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
