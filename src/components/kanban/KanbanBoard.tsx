import { useState } from 'react'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { staggerContainer } from '@/hooks/useAnimations'
import { SETORES, corDoSetor } from '@/lib/constants'
import { KanbanSkeleton } from '@/components/ui/Skeleton'
import type { OrdemServico, EtapaKanban } from '@/types'

interface KanbanBoardProps {
  ordens: OrdemServico[]
  etapas: EtapaKanban[]
  loading: boolean
  onMove: (osId: string, novoStatus: string) => void
  onEdit: (os: OrdemServico) => void
  onDelete: (id: string) => void
}

export function KanbanBoard({ ordens, etapas, loading, onMove, onEdit, onDelete }: KanbanBoardProps) {
  const [setorAtivo, setSetorAtivo] = useState(SETORES[0].nome)
  const [draggingOS, setDraggingOS] = useState<OrdemServico | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const ordensFiltradas = ordens.filter(o => o.setor === setorAtivo)

  const handleDragStart = (event: DragStartEvent) => {
    const os = ordens.find(o => o.id === event.active.id)
    if (os) setDraggingOS(os)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingOS(null)
    const { active, over } = event
    if (!over) return
    const osId = active.id as string
    const novoStatus = over.id as string
    const os = ordens.find(o => o.id === osId)
    if (os && os.status !== novoStatus) {
      onMove(osId, novoStatus)
    }
  }

  if (loading) return <KanbanSkeleton />

  return (
    <div>
      {/* Tabs de setor */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {SETORES.map(s => {
          const count = ordens.filter(o => o.setor === s.nome).length
          const active = setorAtivo === s.nome
          return (
            <button
              key={s.nome}
              onClick={() => setSetorAtivo(s.nome)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-semibold whitespace-nowrap transition-all duration-200 border ${
                active
                  ? 'text-white shadow-lg'
                  : 'text-dark-muted bg-dark-surface2 border-dark-border hover:text-white hover:bg-dark-surface'
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

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <motion.div
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {etapas.map(etapa => (
            <KanbanColumn
              key={etapa.label}
              etapa={etapa}
              ordens={ordensFiltradas.filter(o => o.status === etapa.label)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </motion.div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
          {draggingOS ? (
            <div className="rotate-2 opacity-90">
              <KanbanCard os={draggingOS} onEdit={() => {}} onDelete={() => {}} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
