import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { OSTable } from '@/components/os/OSTable'
import { OSForm } from '@/components/os/OSForm'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import type { OrdemServico, EtapaKanban, CampoConfig, OSVinculo, Profile } from '@/types'

interface OrdensServicoPageProps {
  ordens: OrdemServico[]
  todasEtapas: EtapaKanban[]
  etapasDoSetor: (setor: string) => EtapaKanban[]
  campos: CampoConfig[]
  profiles: Profile[]
  vinculos: OSVinculo[]
  criarVinculo: (origemId: string, destinoId: string) => Promise<void>
  loading: boolean
  onCriar: (os: Partial<OrdemServico>) => Promise<string | undefined>
  onAtualizar: (id: string, dados: Partial<OrdemServico>) => Promise<void>
  onExcluir: (id: string) => Promise<void>
  onEncerrar: (id: string, operador: string) => Promise<void>
  onAdicionarSetor: (osId: string, setor: string, statusInicial: string) => Promise<void>
  onRemoverSetor: (osSetorId: string) => Promise<void>
  onCarregarKanban: () => Promise<void>
}

export function OrdensServico({ ordens, todasEtapas, etapasDoSetor, campos, profiles, vinculos, criarVinculo, loading, onCriar, onAtualizar, onExcluir, onEncerrar, onAdicionarSetor, onRemoverSetor, onCarregarKanban }: OrdensServicoPageProps) {
  const [modalCriar, setModalCriar] = useState(false)
  const [osEditando, setOsEditando] = useState<OrdemServico | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

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
        if (setoresIniciais?.length) {
          for (const s of setoresIniciais) {
            try {
              await onAdicionarSetor(novoId, s.setor, s.status)
            } catch (err) {
              console.error(`Falha ao adicionar setor ${s.setor}:`, (err as Error).message)
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
      setOsEditando(null)
      toast('OS atualizada!')
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
    setSaving(false)
  }

  const handleEncerrar = async (osId: string) => {
    const os = ordens.find(o => o.id === osId)
    try {
      await onEncerrar(osId, os?.operador || '')
      setOsEditando(null)
      toast('OS encerrada e registrada!')
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
  }

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir esta OS?')) return
    try {
      await onExcluir(id)
      toast('OS excluida')
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
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
          <OSForm
            etapasDoSetor={etapasDoSetor} campos={campos} profiles={profiles} ordens={ordens}
            onSave={handleCriar} onCancel={() => setModalCriar(false)} saving={saving}
            onAdicionarSetor={onAdicionarSetor} onRemoverSetor={onRemoverSetor} onCarregarKanban={onCarregarKanban}
          />
        </Modal>

        <Modal open={!!osEditando} onClose={() => setOsEditando(null)} title={`Editar ${osEditando?.numero || ''}`} size="lg">
          {osEditando && (
            <OSForm
              os={osEditando} etapasDoSetor={etapasDoSetor} campos={campos} profiles={profiles} ordens={ordens}
              onSave={handleEditar} onCancel={() => setOsEditando(null)} saving={saving}
              onAdicionarSetor={onAdicionarSetor} onRemoverSetor={onRemoverSetor} onCarregarKanban={onCarregarKanban}
              onEncerrar={handleEncerrar}
            />
          )}
        </Modal>
      </div>
    </PageTransition>
  )
}
