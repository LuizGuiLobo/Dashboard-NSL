import { useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { Pencil, Trash2, User, Clock, Link } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { diasDesdeEntrada, badgeDias } from '@/lib/utils'
import { corDoSetor } from '@/lib/constants'
import type { KanbanItem } from '@/types'

interface KanbanCardProps {
  item: KanbanItem
  vinculosCount?: number
  onEdit: (item: KanbanItem) => void
  onDelete: (osId: string) => void
  overlay?: boolean
}

export function KanbanCard({ item, vinculosCount, onEdit, onDelete, overlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.os_setor_id })
  const dias = diasDesdeEntrada(item.data_entrada)
  const diasStyle = badgeDias(dias)
  const isSecundario = item.setor !== item.setor_principal

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
        <span className="text-xs font-mono font-bold text-accent">{item.numero}</span>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(item) }}
            className="p-1 rounded text-dark-muted hover:text-accent hover:bg-accent/10 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.os_id) }}
            className="p-1 rounded text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Setor badge (secundário) */}
      {isSecundario && (
        <div
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-body font-semibold mb-2 border"
          style={{
            backgroundColor: `${corDoSetor(item.setor)}18`,
            color: corDoSetor(item.setor),
            borderColor: `${corDoSetor(item.setor)}35`,
          }}
        >
          + {item.setor}
        </div>
      )}

      {/* Tipo badge */}
      {item.tipo && (
        <Badge color={item.tipo === 'Veículo' ? '#3b82f6' : '#10b981'} className="mb-2 text-[10px]">
          {item.tipo === 'Veículo' ? '🚛' : '🔧'} {item.tipo}
        </Badge>
      )}

      {/* Info */}
      {item.placa && <p className="text-sm font-mono font-bold text-onsurface">{item.placa}</p>}
      {item.modelo && <p className="text-xs text-dark-muted">{item.modelo}</p>}
      <p className="text-sm font-body font-semibold text-onsurface mt-1">{item.cliente}</p>

      {/* Dias */}
      <div className={`flex items-center gap-1 mt-2 text-xs font-mono font-bold px-2 py-1 rounded border w-fit ${diasStyle.bg} ${diasStyle.cor}`}>
        <Clock className="w-3 h-3" /> {dias}d
      </div>

      {/* Operador */}
      {item.operador && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-dark-muted">
          <User className="w-3 h-3" /> {item.operador}
        </div>
      )}

      {/* Vínculos */}
      {!!vinculosCount && (
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-primary font-mono">
          <Link className="w-3 h-3" /> {vinculosCount} vínculo{vinculosCount > 1 ? 's' : ''}
        </div>
      )}

      {/* Observações preview */}
      {item.observacoes && (
        <p className="text-xs text-dark-muted mt-2 line-clamp-2 pt-2" style={{ borderTop: '1px solid rgba(68,70,79,0.3)' }}>
          {item.observacoes}
        </p>
      )}
    </motion.div>
  )
}
