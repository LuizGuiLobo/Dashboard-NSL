import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { OSTable } from '@/components/os/OSTable'
import { OSForm } from '@/components/os/OSForm'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import type { OrdemServico, EtapaKanban, CampoConfig, Operador, OSVinculo } from '@/types'

interface OrdensServicoPageProps {
  ordens: OrdemServico[]
  todasEtapas: EtapaKanban[]
  etapasDoSetor: (setor: string) => EtapaKanban[]
  campos: CampoConfig[]
  operadores: Operador[]
  vinculos: OSVinculo[]
  criarVinculo: (origemId: string, destinoId: string) => Promise<void>
  loading: boolean
  onCriar: (os: Partial<OrdemServico>) => Promise<string | undefined>
  onAtualizar: (id: string, dados: Partial<OrdemServico>) => Promise<void>
  onExcluir: (id: string) => Promise<void>
}

export function OrdensServico({ ordens, todasEtapas, etapasDoSetor, campos, operadores, vinculos, criarVinculo, loading, onCriar, onAtualizar, onExcluir }: OrdensServicoPageProps) {
  const [modalCriar, setModalCriar] = useState(false)
  const [osEditando, setOsEditando] = useState<OrdemServico | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleCriar = async (data: Partial<OrdemServico>, vinculoId?: string) => {
    setSaving(true)
    try {
      const novoId = await onCriar(data)
      if (vinculoId && novoId) await criarVinculo(novoId, vinculoId)
      setModalCriar(false)
      toast('OS criada com sucesso!')
    } catch (e: any) {
      toast(e.message, 'error')
    }
    setSaving(false)
  }

  const handleEditar = async (data: Partial<OrdemServico>) => {
    if (!osEditando) return
    setSaving(true)
    try {
      await onAtualizar(osEditando.id, data)
      setOsEditando(null)
      toast('OS atualizada!')
    } catch (e: any) {
      toast(e.message, 'error')
    }
    setSaving(false)
  }

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir esta OS?')) return
    try {
      await onExcluir(id)
      toast('OS excluida')
    } catch (e: any) {
      toast(e.message, 'error')
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display tracking-wider text-onsurface">ORDENS DE SERVICO</h1>
          <button onClick={() => setModalCriar(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black font-body font-bold text-sm hover:bg-accent-hover transition-all shadow-lg shadow-accent/20">
            <Plus className="w-4 h-4" /> Nova OS
          </button>
        </div>

        <OSTable
          ordens={ordens}
          todasEtapas={todasEtapas}
          etapasDoSetor={etapasDoSetor}
          loading={loading}
          onEdit={setOsEditando}
          onDelete={handleExcluir}
          onAtualizar={onAtualizar}
        />

        <Modal open={modalCriar} onClose={() => setModalCriar(false)} title="Nova Ordem de Servico" size="lg">
          <OSForm etapasDoSetor={etapasDoSetor} campos={campos} operadores={operadores} ordens={ordens} onSave={handleCriar} onCancel={() => setModalCriar(false)} saving={saving} />
        </Modal>

        <Modal open={!!osEditando} onClose={() => setOsEditando(null)} title={`Editar ${osEditando?.numero || ''}`} size="lg">
          {osEditando && (
            <OSForm os={osEditando} etapasDoSetor={etapasDoSetor} campos={campos} operadores={operadores} ordens={ordens} onSave={handleEditar} onCancel={() => setOsEditando(null)} saving={saving} />
          )}
        </Modal>
      </div>
    </PageTransition>
  )
}
