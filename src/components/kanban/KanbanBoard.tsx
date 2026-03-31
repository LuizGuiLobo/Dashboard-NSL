import { useState, useMemo } from 'react'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { staggerContainer } from '@/hooks/useAnimations'
import { SETORES } from '@/lib/constants'
import { KanbanSkeleton } from '@/components/ui/Skeleton'
import type { OrdemServico, EtapaKanban, OSVinculo } from '@/types'

interface KanbanBoardProps {
  ordens: OrdemServico[]
  etapasDoSetor: (setor: string) => EtapaKanban[]
  vinculos: OSVinculo[]
  loading: boolean
  onMove: (osId: string, novoStatus: string) => void
  onEdit: (os: OrdemServico) => void
  onDelete: (id: string) => void
}

export function KanbanBoard({ ordens, etapasDoSetor, vinculos, loading, onMove, onEdit, onDelete }: KanbanBoardProps) {
  const [setorAtivo, setSetorAtivo] = useState(SETORES[0].nome)
  const [draggingOS, setDraggingOS] = useState<OrdemServico | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const ordensFiltradas = ordens.filter(o => o.setor === setorAtivo)
  const etapas = etapasDoSetor(setorAtivo)

  // Count vinculos per OS (appears on both sides of the relation)
  const vinculosCountMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    vinculos.forEach(v => {
      map[v.os_origem] = (map[v.os_origem] || 0) + 1
      map[v.os_destino] = (map[v.os_destino] || 0) + 1
    })
    return map
  }, [vinculos])

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
                  : 'text-dark-muted bg-dark-surface2 border-dark-border hover:text-onsurface hover:bg-dark-surface'
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

      {/* Board - animated per setor */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <AnimatePresence mode="wait">
          <motion.div
            key={setorAtivo}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -30, transition: { duration: 0.15 } }}
          >
            {etapas.length === 0 ? (
              <div className="flex-1 text-center py-16 text-dark-muted font-body">
                <p className="text-lg mb-2">Nenhuma etapa configurada para este setor</p>
                <p className="text-sm">Vá em Configurações → Etapas do Kanban para criar as etapas de "{setorAtivo}"</p>
              </div>
            ) : (
              etapas.map(etapa => (
                <KanbanColumn
                  key={etapa.id}
                  etapa={etapa}
                  ordens={ordensFiltradas.filter(o => o.status === etapa.label)}
                  vinculosCountMap={vinculosCountMap}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>

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
