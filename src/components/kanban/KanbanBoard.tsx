import { useState, useMemo } from 'react'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { staggerContainer } from '@/hooks/useAnimations'
import { SETORES } from '@/lib/constants'
import { KanbanSkeleton } from '@/components/ui/Skeleton'
import type { KanbanItem, EtapaKanban, OSVinculo } from '@/types'

interface KanbanBoardProps {
  items: KanbanItem[]
  etapasDoSetor: (setor: string) => EtapaKanban[]
  vinculos: OSVinculo[]
  loading: boolean
  onMove: (osSetorId: string, novoStatus: string) => void
  onEdit: (item: KanbanItem) => void
  onDelete: (osId: string) => void
}

export function KanbanBoard({ items, etapasDoSetor, vinculos, loading, onMove, onEdit, onDelete }: KanbanBoardProps) {
  const [setorAtivo, setSetorAtivo] = useState(SETORES[0].nome)
  const [dragging, setDragging] = useState<KanbanItem | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const itensFiltrados = items.filter(i => i.setor === setorAtivo)
  const etapas = etapasDoSetor(setorAtivo)

  const vinculosCountMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    vinculos.forEach(v => {
      map[v.os_origem] = (map[v.os_origem] || 0) + 1
      map[v.os_destino] = (map[v.os_destino] || 0) + 1
    })
    return map
  }, [vinculos])

  const handleDragStart = (event: DragStartEvent) => {
    const item = items.find(i => i.os_setor_id === event.active.id)
    if (item) setDragging(item)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDragging(null)
    const { active, over } = event
    if (!over) return
    const osSetorId = active.id as string
    const novoStatus = over.id as string
    const item = items.find(i => i.os_setor_id === osSetorId)
    if (item && item.status_atual !== novoStatus) {
      onMove(osSetorId, novoStatus)
    }
  }

  if (loading) return <KanbanSkeleton />

  return (
    <div>
      {/* Tabs de setor */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {SETORES.map(s => {
          const count = items.filter(i => i.setor === s.nome).length
          const active = setorAtivo === s.nome
          return (
            <button
              key={s.nome}
              onClick={() => setSetorAtivo(s.nome)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-semibold whitespace-nowrap transition-all duration-200 border ${
                active ? 'text-white shadow-lg' : 'text-dark-muted bg-dark-surface2 border-dark-border hover:text-onsurface hover:bg-dark-surface'
              }`}
              style={active ? {
                backgroundColor: `${s.cor}20`, borderColor: `${s.cor}50`,
                color: s.cor, boxShadow: `0 4px 20px ${s.cor}15`,
              } : undefined}
            >
              {s.icon} {s.nome.split(' ').slice(0, 2).join(' ')}
              {count > 0 && <span className="text-xs font-mono opacity-70">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <AnimatePresence mode="wait">
          <motion.div
            key={setorAtivo}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin"
            variants={staggerContainer}
            initial="hidden" animate="visible"
            exit={{ opacity: 0, x: -30, transition: { duration: 0.15 } }}
          >
            {etapas.length === 0 ? (
              <div className="flex-1 text-center py-16 text-dark-muted font-body">
                <p className="text-lg mb-2">Nenhuma etapa configurada para este setor</p>
                <p className="text-sm">Vá em Configurações → Etapas do Kanban</p>
              </div>
            ) : (
              etapas.map(etapa => (
                <KanbanColumn
                  key={etapa.id}
                  etapa={etapa}
                  items={itensFiltrados.filter(i => i.status_atual === etapa.label)}
                  vinculosCountMap={vinculosCountMap}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
          {dragging ? (
            <div className="rotate-2 opacity-90">
              <KanbanCard item={dragging} onEdit={() => {}} onDelete={() => {}} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
