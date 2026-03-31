import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { KanbanCard } from './KanbanCard'
import { staggerItem } from '@/hooks/useAnimations'
import type { OrdemServico, EtapaKanban } from '@/types'

interface KanbanColumnProps {
  etapa: EtapaKanban
  ordens: OrdemServico[]
  vinculosCountMap: Record<string, number>
  onEdit: (os: OrdemServico) => void
  onDelete: (id: string) => void
}

export function KanbanColumn({ etapa, ordens, vinculosCountMap, onEdit, onDelete }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: etapa.label })

  return (
    <motion.div
      ref={setNodeRef}
      variants={staggerItem}
      className={`min-w-[280px] w-[280px] flex-shrink-0 rounded-xl transition-all duration-300 ${
        isOver ? 'ring-2 ring-offset-2 ring-offset-dark-bg' : ''
      }`}
      style={isOver ? { ['--tw-ring-color' as any]: etapa.cor } : undefined}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: etapa.cor }} />
        <h3 className="text-xs font-display font-bold tracking-widest text-onsurface uppercase">{etapa.label}</h3>
        <span
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${etapa.cor}18`, color: etapa.cor }}
        >
          {ordens.length}
        </span>
      </div>

      {/* Cards */}
      <div className={`space-y-2.5 min-h-[100px] p-2 rounded-lg transition-colors duration-300 ${
        isOver ? 'bg-dark-surface2/40' : 'bg-transparent'
      }`}>
        {ordens.length === 0 ? (
          <div className="text-center py-8 text-dark-muted text-xs font-body">vazio</div>
        ) : (
          ordens.map(os => (
            <KanbanCard
              key={os.id}
              os={os}
              vinculosCount={vinculosCountMap[os.id] || 0}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </motion.div>
  )
}
