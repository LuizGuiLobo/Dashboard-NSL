import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { Pencil, Trash2, User, Clock, Link } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { diasDesdeEntrada, badgeDias } from '@/lib/utils'
import { corDoSetor } from '@/lib/constants'
import type { OrdemServico } from '@/types'

interface KanbanCardProps {
  os: OrdemServico
  vinculosCount?: number
  onEdit: (os: OrdemServico) => void
  onDelete: (id: string) => void
  overlay?: boolean
}

export function KanbanCard({ os, vinculosCount, onEdit, onDelete, overlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: os.id })
  const dias = diasDesdeEntrada(os.data_entrada)
  const diasStyle = badgeDias(dias)

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <motion.div
      ref={!overlay ? setNodeRef : undefined}
      style={style}
      {...(!overlay ? { ...attributes, ...listeners } : {})}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      whileHover={!overlay ? { scale: 1.015 } : undefined}
      className={`bg-dark-surface3 rounded-lg p-4 cursor-grab active:cursor-grabbing transition-shadow ${
        overlay
          ? 'shadow-[0px_24px_48px_rgba(0,0,0,0.5)] ring-2 ring-accent/40'
          : 'hover:shadow-[0px_8px_24px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-bold text-accent">{os.numero}</span>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(os) }}
            className="p-1 rounded text-dark-muted hover:text-accent hover:bg-accent/10 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(os.id) }}
            className="p-1 rounded text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tipo badge */}
      {os.tipo && (
        <Badge color={os.tipo === 'Veículo' ? '#3b82f6' : '#10b981'} className="mb-2 text-[10px]">
          {os.tipo === 'Veículo' ? '🚛' : '🔧'} {os.tipo}
        </Badge>
      )}

      {/* Info */}
      {os.placa && <p className="text-sm font-mono font-bold text-onsurface">{os.placa}</p>}
      {os.modelo && <p className="text-xs text-dark-muted">{os.modelo}</p>}
      <p className="text-sm font-body font-semibold text-onsurface mt-1">{os.cliente}</p>

      {/* Dias */}
      <div className={`flex items-center gap-1 mt-2 text-xs font-mono font-bold px-2 py-1 rounded border w-fit ${diasStyle.bg} ${diasStyle.cor}`}>
        <Clock className="w-3 h-3" /> {dias}d
      </div>

      {/* Operador */}
      {os.operador && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-dark-muted">
          <User className="w-3 h-3" /> {os.operador}
        </div>
      )}

      {/* Vinculos */}
      {!!vinculosCount && (
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-primary font-mono">
          <Link className="w-3 h-3" /> {vinculosCount} vínculo{vinculosCount > 1 ? 's' : ''}
        </div>
      )}

      {/* Observacoes preview */}
      {os.observacoes && (
        <p className="text-xs text-dark-muted mt-2 line-clamp-2 pt-2" style={{ borderTop: '1px solid rgba(68,70,79,0.3)' }}>
          {os.observacoes}
        </p>
      )}
    </motion.div>
  )
}
