import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, ShieldCheck, User, KeyRound, X, Check, Phone } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { staggerContainer, staggerItem } from '@/hooks/useAnimations'
import { SETORES } from '@/lib/constants'
import type { Profile } from '@/types'
import type { User as SupaUser } from '@supabase/supabase-js'

interface UsuariosProps {
  currentUser: SupaUser
  profiles: Profile[]
  onSalvarProfile: (id: string, dados: Partial<Profile>) => Promise<void>
  onCarregarProfiles: () => Promise<void>
}

const SETOR_CORES: Record<string, string> = {
  'Bomba Injetora':        'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Bomba de Alta':         'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Injetores Mecânicos':   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Injetores Eletrônicos': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Veículo Diesel':        'bg-red-500/15 text-red-400 border-red-500/30',
  'Turbinas':              'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
}

export function Usuarios({ currentUser, profiles, onSalvarProfile, onCarregarProfiles }: UsuariosProps) {
  const { toast } = useToast()
  const isAdmin = profiles.find(p => p.id === currentUser.id)?.role === 'admin'
  const myProfile = profiles.find(p => p.id === currentUser.id)

  // Modals
  const [modalCriar, setModalCriar] = useState(false)
  const [editando, setEditando] = useState<Profile | null>(null)
  const [trocandoSenha, setTrocandoSenha] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form criar
  const [novoUser, setNovoUser] = useState({
    email: '', senha: '', nome: '', role: 'user' as 'admin' | 'user',
    setores: [] as string[], telefone: '',
  })

  // Form editar
  const [editForm, setEditForm] = useState({
    nome: '', role: 'user' as 'admin' | 'user', ativo: true,
    setores: [] as string[], telefone: '',
  })

  // Form senha
  const [senhaForm, setSenhaForm] = useState({ nova: '', confirmar: '' })

  const inputClass = 'w-full bg-dark-surface2 border border-dark-border rounded-lg px-3 py-2.5 text-sm text-onsurface font-body placeholder-dark-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all'
  const labelClass = 'text-xs font-body font-semibold text-dark-muted uppercase tracking-wider mb-1.5 block'
  const btnSave = 'px-5 py-2.5 rounded-xl bg-accent text-black font-body font-bold text-sm hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 disabled:opacity-50'

  const toggleSetor = (lista: string[], setor: string): string[] =>
    lista.includes(setor) ? lista.filter(s => s !== setor) : [...lista, setor]

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase.rpc('admin_criar_usuario', {
        p_email: novoUser.email,
        p_senha: novoUser.senha,
        p_nome: novoUser.nome,
        p_role: novoUser.role,
      })
      if (error) throw new Error(error.message)
      // Buscar o profile recém-criado pelo email para salvar setores/telefone
      const { data: prof } = await supabase
        .from('profiles').select('id').order('criado_em', { ascending: false }).limit(1).single()
      if (prof?.id && (novoUser.setores.length || novoUser.telefone)) {
        await supabase.from('profiles').update({
          setores: novoUser.setores, telefone: novoUser.telefone,
        }).eq('id', prof.id)
      }
      toast('Usuário criado com sucesso!')
      setModalCriar(false)
      setNovoUser({ email: '', senha: '', nome: '', role: 'user', setores: [], telefone: '' })
      await onCarregarProfiles()
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
    setSaving(false)
  }

  const abrirEditar = (p: Profile) => {
    setEditando(p)
    setEditForm({ nome: p.nome, role: p.role, ativo: p.ativo, setores: p.setores || [], telefone: p.telefone || '' })
  }

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    setSaving(true)
    try {
      await onSalvarProfile(editando.id, {
        nome: editForm.nome,
        role: editForm.role,
        ativo: editForm.ativo,
        setores: editForm.setores,
        telefone: editForm.telefone,
      })
      toast('Usuário atualizado!')
      setEditando(null)
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
    setSaving(false)
  }

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    if (senhaForm.nova !== senhaForm.confirmar) { toast('As senhas não conferem.', 'error'); return }
    if (senhaForm.nova.length < 6) { toast('Mínimo 6 caracteres.', 'error'); return }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: senhaForm.nova })
      if (error) throw new Error(error.message)
      toast('Senha alterada com sucesso!')
      setTrocandoSenha(false)
      setSenhaForm({ nova: '', confirmar: '' })
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
    setSaving(false)
  }

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir usuário "${nome}"?`)) return
    try {
      const { error } = await supabase.rpc('admin_excluir_usuario', { p_user_id: id })
      if (error) throw new Error(error.message)
      toast('Usuário excluído.')
      await onCarregarProfiles()
    } catch (e: unknown) {
      toast((e as Error).message, 'error')
    }
  }

  const SetoresChips = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => (
    <div className="flex flex-wrap gap-2">
      {SETORES.map(s => {
        const ativo = value.includes(s.nome)
        return (
          <button
            key={s.nome} type="button"
            onClick={() => onChange(toggleSetor(value, s.nome))}
            className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold border transition-all ${
              ativo ? SETOR_CORES[s.nome] || 'bg-accent/15 text-accent border-accent/30' : 'text-dark-muted border-dark-border hover:text-onsurface'
            }`}
          >
            {s.nome}
          </button>
        )
      })}
    </div>
  )

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display tracking-wider text-onsurface">USUÁRIOS</h1>
          {isAdmin && (
            <button onClick={() => setModalCriar(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black font-body font-bold text-sm hover:bg-accent-hover transition-all shadow-lg shadow-accent/20">
              <Plus className="w-4 h-4" /> Novo Usuário
            </button>
          )}
        </div>

        {/* Meu perfil */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-body font-semibold text-onsurface">{myProfile?.nome || currentUser.email}</p>
                <p className="text-xs text-dark-muted font-body">{currentUser.email}</p>
                {myProfile?.telefone && (
                  <p className="text-xs text-dark-muted font-body flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />{myProfile.telefone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-body font-semibold border ${
                isAdmin ? 'bg-accent/10 text-accent border-accent/30' : 'bg-dark-surface2 text-dark-muted border-dark-border'
              }`}>
                {isAdmin ? <><ShieldCheck className="w-3.5 h-3.5" /> Admin</> : <><User className="w-3.5 h-3.5" /> Usuário</>}
              </span>
              <button onClick={() => myProfile && abrirEditar(myProfile)} className="p-2 rounded-lg text-dark-muted hover:text-accent hover:bg-accent/10 transition-all" title="Editar perfil">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => setTrocandoSenha(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body text-dark-muted hover:text-accent hover:bg-accent/10 border border-dark-border transition-all">
                <KeyRound className="w-3.5 h-3.5" /> Alterar senha
              </button>
            </div>
          </div>
          {/* Setores do meu perfil */}
          {myProfile?.setores?.length ? (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-dark-border">
              {myProfile.setores.map(s => (
                <span key={s} className={`px-2.5 py-1 rounded-lg text-[11px] font-body font-semibold border ${SETOR_CORES[s] || 'bg-dark-surface2 text-dark-muted border-dark-border'}`}>{s}</span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Lista todos os usuários (admin) */}
        {isAdmin && (
          <div className="space-y-3">
            <p className="text-xs font-display tracking-wider text-dark-muted">TODOS OS USUÁRIOS</p>
            <motion.div className="space-y-2" variants={staggerContainer} initial="hidden" animate="visible">
              {profiles.map(p => (
                <motion.div key={p.id} variants={staggerItem} className="bg-dark-surface border border-dark-border rounded-xl px-4 py-3 hover:border-dark-border/80 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 ${
                        p.role === 'admin' ? 'bg-accent/10 border-accent/30' : 'bg-dark-surface2 border-dark-border'
                      }`}>
                        {p.role === 'admin' ? <ShieldCheck className="w-4 h-4 text-accent" /> : <User className="w-4 h-4 text-dark-muted" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-body font-semibold text-onsurface">{p.nome || '(sem nome)'}</span>
                          {p.id === currentUser.id && <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded">você</span>}
                          {!p.ativo && <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">inativo</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`text-xs font-body ${p.role === 'admin' ? 'text-accent' : 'text-dark-muted'}`}>
                            {p.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </span>
                          {p.email && <span className="text-xs text-dark-muted font-body">{p.email}</span>}
                          {p.telefone && (
                            <span className="text-xs text-dark-muted font-body flex items-center gap-1">
                              <Phone className="w-3 h-3" />{p.telefone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => abrirEditar(p)} className="p-1.5 rounded-lg text-dark-muted hover:text-accent hover:bg-accent/10 transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {p.id !== currentUser.id && (
                        <button onClick={() => handleExcluir(p.id, p.nome)} className="p-1.5 rounded-lg text-dark-muted hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Setores do usuário */}
                  {p.setores?.length ? (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-dark-border">
                      {p.setores.map(s => (
                        <span key={s} className={`px-2 py-0.5 rounded-md text-[11px] font-body font-semibold border ${SETOR_CORES[s] || 'bg-dark-surface2 text-dark-muted border-dark-border'}`}>{s}</span>
                      ))}
                    </div>
                  ) : null}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Modal criar usuário */}
      <Modal open={modalCriar} onClose={() => setModalCriar(false)} title="Novo Usuário" size="sm">
        <form onSubmit={handleCriar} className="space-y-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input className={inputClass} value={novoUser.nome} onChange={e => setNovoUser(p => ({ ...p, nome: e.target.value }))} required placeholder="Nome completo" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} value={novoUser.email} onChange={e => setNovoUser(p => ({ ...p, email: e.target.value }))} required placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input className={inputClass} value={novoUser.telefone} onChange={e => setNovoUser(p => ({ ...p, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label className={labelClass}>Senha inicial</label>
            <input type="password" className={inputClass} value={novoUser.senha} onChange={e => setNovoUser(p => ({ ...p, senha: e.target.value }))} required placeholder="mínimo 6 caracteres" minLength={6} />
          </div>
          <div>
            <label className={labelClass}>Setores de atuação</label>
            <SetoresChips value={novoUser.setores} onChange={v => setNovoUser(p => ({ ...p, setores: v }))} />
          </div>
          <div>
            <label className={labelClass}>Nível de acesso</label>
            <div className="flex gap-2">
              {(['user', 'admin'] as const).map(r => (
                <button key={r} type="button" onClick={() => setNovoUser(p => ({ ...p, role: r }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-body font-semibold border transition-all ${
                    novoUser.role === r ? 'bg-accent/15 text-accent border-accent/30' : 'text-dark-muted border-dark-border hover:text-onsurface'
                  }`}>
                  {r === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {r === 'admin' ? 'Admin' : 'Usuário'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-dark-border">
            <button type="button" onClick={() => setModalCriar(false)} className="px-4 py-2 rounded-xl text-sm font-body text-dark-muted bg-dark-surface2 border border-dark-border hover:text-onsurface transition-all">Cancelar</button>
            <button type="submit" disabled={saving} className={btnSave}>{saving ? 'Criando...' : 'Criar Usuário'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal editar usuário */}
      <Modal open={!!editando} onClose={() => setEditando(null)} title={editando?.id === currentUser.id ? 'Editar Meu Perfil' : `Editar — ${editando?.nome}`} size="sm">
        <form onSubmit={handleEditar} className="space-y-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input className={inputClass} value={editForm.nome} onChange={e => setEditForm(p => ({ ...p, nome: e.target.value }))} required />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input className={inputClass} value={editForm.telefone} onChange={e => setEditForm(p => ({ ...p, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label className={labelClass}>Setores de atuação</label>
            <SetoresChips value={editForm.setores} onChange={v => setEditForm(p => ({ ...p, setores: v }))} />
          </div>
          {isAdmin && editando?.id !== currentUser.id && (
            <>
              <div>
                <label className={labelClass}>Nível de acesso</label>
                <div className="flex gap-2">
                  {(['user', 'admin'] as const).map(r => (
                    <button key={r} type="button" onClick={() => setEditForm(p => ({ ...p, role: r }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-body font-semibold border transition-all ${
                        editForm.role === r ? 'bg-accent/15 text-accent border-accent/30' : 'text-dark-muted border-dark-border hover:text-onsurface'
                      }`}>
                      {r === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      {r === 'admin' ? 'Admin' : 'Usuário'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-surface2 rounded-xl border border-dark-border">
                <span className="text-sm font-body text-onsurface">Conta ativa</span>
                <button type="button" onClick={() => setEditForm(p => ({ ...p, ativo: !p.ativo }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${editForm.ativo ? 'bg-accent' : 'bg-dark-border'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${editForm.ativo ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-dark-border">
            <button type="button" onClick={() => setEditando(null)} className="px-4 py-2 rounded-xl text-sm font-body text-dark-muted bg-dark-surface2 border border-dark-border hover:text-onsurface transition-all">Cancelar</button>
            <button type="submit" disabled={saving} className={btnSave}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal trocar senha */}
      <Modal open={trocandoSenha} onClose={() => setTrocandoSenha(false)} title="Alterar Senha" size="sm">
        <form onSubmit={handleTrocarSenha} className="space-y-4">
          <div>
            <label className={labelClass}>Nova senha</label>
            <input type="password" className={inputClass} value={senhaForm.nova} onChange={e => setSenhaForm(p => ({ ...p, nova: e.target.value }))} required placeholder="mínimo 6 caracteres" minLength={6} />
          </div>
          <div>
            <label className={labelClass}>Confirmar nova senha</label>
            <input type="password" className={inputClass} value={senhaForm.confirmar} onChange={e => setSenhaForm(p => ({ ...p, confirmar: e.target.value }))} required />
          </div>
          {senhaForm.nova && senhaForm.confirmar && (
            <div className={`flex items-center gap-2 text-xs font-body px-3 py-2 rounded-lg border ${
              senhaForm.nova === senhaForm.confirmar ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'
            }`}>
              {senhaForm.nova === senhaForm.confirmar ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              {senhaForm.nova === senhaForm.confirmar ? 'Senhas conferem' : 'Senhas não conferem'}
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-dark-border">
            <button type="button" onClick={() => setTrocandoSenha(false)} className="px-4 py-2 rounded-xl text-sm font-body text-dark-muted bg-dark-surface2 border border-dark-border hover:text-onsurface transition-all">Cancelar</button>
            <button type="submit" disabled={saving} className={btnSave}>{saving ? 'Salvando...' : 'Alterar Senha'}</button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  )
}
