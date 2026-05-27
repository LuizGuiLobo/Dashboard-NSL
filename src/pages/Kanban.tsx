import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { OSForm } from '@/components/os/OSForm'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import type { OrdemServico, EtapaKanban, CampoConfig, OSVinculo, Profile, KanbanItem } from '@/types'

interface KanbanPageProps {
  ordens: OrdemServico[]
  etapasDoSetor: (setor: string) => EtapaKanban[]
  todasEtapas: EtapaKanban[]
  campos: CampoConfig[]
  profiles: Profile[]
  vinculos: OSVinculo[]
  criarVinculo: (origemId: string, destinoId: string) => Promise<void>
  kanbanItems: KanbanItem[]
  loadingKanban: boolean
  onMoverStatus: (osSetorId: string, novoStatus: string) => Promise<void>
  onAdicionarSetor: (osId: string, setor: string, statusInicial: string) => Promise<void>
  onRemoverSetor: (osSetorId: string) => Promise<void>
  onCarregarKanban: () => Promise<void>
  loading: boolean
  onCriar: (os: Partial<OrdemServico>) => Promise<string | undefined>
  onAtualizar: (id: string, dados: Partial<OrdemServico>) => Promise<void>
  onExcluir: (id: string) => Promise<void>
}

export function Kanban({
  ordens, etapasDoSetor, todasEtapas, campos, profiles,
  vinculos, criarVinculo,
  kanbanItems, loadingKanban,
  onMoverStatus, onAdicionarSetor, onRemoverSetor, onCarregarKanban,
  loading, onCriar, onAtualizar, onExcluir,
}: KanbanPageProps) {
  const [modalCriar, setModalCriar] = useState(false)
  const [osEditando, setOsEditando] = useState<OrdemServico | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Recarrega o Kanban sempre que a página é montada (navegação entre abas)
  useEffect(() => {
    onCarregarKanban()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMove = async (osSetorId: string, novoStatus: string) => {
    try {
      await onMoverStatus(osSetorId, novoStatus)
      toast(`Movido para ${novoStatus}`)
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
  }

  const handleEdit = (item: KanbanItem) => {
    const os = ordens.find(o => o.id === item.os_id)
    if (os) setOsEditando(os)
  }

  const handleCriar = async (
    data: Partial<OrdemServico>,
    vinculoId?: string,
    responsaveisIds?: string[],
    setoresIniciais?: { setor: string; status: string }[],
  ) => {
    setSaving(true)
    try {
      const novoId = await onCriar(data)
      if (novoId) {
        if (vinculoId) await criarVinculo(novoId, vinculoId)
        if (responsaveisIds?.length) {
          const rows = responsaveisIds.map(user_id => ({ os_id: novoId, user_id }))
          await supabase.from('os_responsaveis').insert(rows)
        }
        // O trigger trg_os_insert_setor já criou o setor da ordens_servico.setor.
        // Aqui adicionamos TODOS os setores do formulário via RPC (ON CONFLICT DO UPDATE é seguro).
        if (setoresIniciais?.length) {
          for (const s of setoresIniciais) {
            try {
              await onAdicionarSetor(novoId, s.setor, s.status)
            } catch (err) {
              console.error(`Falha ao adicionar setor ${s.setor}:`, (err as Error).message)
              // continua para o próximo setor
            }
          }
        }
        await onCarregarKanban()
      }
      setModalCriar(false)
      toast('OS criada com sucesso!')
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
    setSaving(false)
  }

  const handleEditar = async (
    data: Partial<OrdemServico>,
    _vinculoId?: string,
    responsaveisIds?: string[],
  ) => {
    if (!osEditando) return
    setSaving(true)
    try {
      await onAtualizar(osEditando.id, data)
      if (responsaveisIds !== undefined) {
        await supabase.from('os_responsaveis').delete().eq('os_id', osEditando.id)
        if (responsaveisIds.length) {
          const rows = responsaveisIds.map(user_id => ({ os_id: osEditando.id, user_id }))
          await supabase.from('os_responsaveis').insert(rows)
        }
      }
      await onCarregarKanban()
      setOsEditando(null)
      toast('OS atualizada!')
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
    setSaving(false)
  }

  const handleExcluir = async (osId: string) => {
    if (!confirm('Excluir esta OS?')) return
    try {
      await onExcluir(osId)
      await onCarregarKanban()
      toast('OS excluída')
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display tracking-wider text-onsurface">KANBAN POR SETOR</h1>
          <button
            onClick={() => setModalCriar(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black font-body font-bold text-sm hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
          >
            <Plus className="w-4 h-4" /> Nova OS
          </button>
        </div>

        <KanbanBoard
          items={kanbanItems}
          etapasDoSetor={etapasDoSetor}
          vinculos={vinculos}
          loading={loadingKanban || loading}
          onMove={handleMove}
          onEdit={handleEdit}
          onDelete={handleExcluir}
        />

        <Modal open={modalCriar} onClose={() => setModalCriar(false)} title="Nova Ordem de Serviço" size="lg">
          <OSForm
            etapasDoSetor={etapasDoSetor} campos={campos}
            profiles={profiles} ordens={ordens}
            onSave={handleCriar} onCancel={() => setModalCriar(false)} saving={saving}
            onAdicionarSetor={onAdicionarSetor} onRemoverSetor={onRemoverSetor} onCarregarKanban={onCarregarKanban}
          />
        </Modal>

        <Modal open={!!osEditando} onClose={() => setOsEditando(null)} title={`Editar OS ${osEditando?.numero || ''}`} size="lg">
          {osEditando && (
            <OSForm
              os={osEditando} etapasDoSetor={etapasDoSetor} campos={campos}
              profiles={profiles} ordens={ordens}
              onSave={handleEditar} onCancel={() => setOsEditando(null)} saving={saving}
              onAdicionarSetor={onAdicionarSetor} onRemoverSetor={onRemoverSetor} onCarregarKanban={onCarregarKanban}
            />
          )}
        </Modal>
      </div>
    </PageTransition>
  )
}
