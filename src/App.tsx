import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ToastProvider } from '@/components/ui/Toast'
import { Dashboard } from '@/pages/Dashboard'
import { Kanban } from '@/pages/Kanban'
import { OrdensServico } from '@/pages/OrdensServico'
import { Agenda } from '@/pages/Agenda'
import { Matrizes } from '@/pages/Matrizes'
import { Config } from '@/pages/Config'
import { Login } from '@/pages/Login'
import { Usuarios } from '@/pages/Usuarios'
import { useOrdens, useEtapas, useCampos, useOperadores, useVinculos, useProfiles, useKanban } from '@/hooks/useSupabase'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

function AuthGuard({ children }: { children: (user: User) => React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (user === undefined) return null
  if (user === null) return <Login />
  return <>{children(user)}</>
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { ordens, loading: loadingOS, criar, atualizar, excluir } = useOrdens()
  const { todasEtapas, loading: loadingEtapas, etapasDoSetor, todasEtapasUnicas, salvarSetor, carregar: carregarEtapas } = useEtapas()
  const { campos, loading: loadingCampos, salvar: salvarCampos } = useCampos()
  const { operadores, loading: loadingOps, salvar: salvarOperadores } = useOperadores()
  const { vinculos, criar: criarVinculo } = useVinculos()
  const { profiles, carregar: carregarProfiles, salvar: salvarProfile } = useProfiles()
  const { items: kanbanItems, loading: loadingKanban, carregar: carregarKanban, moverStatus, adicionarSetor, removerSetor } = useKanban()

  const loading = loadingOS || loadingEtapas

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <AuthGuard>
    {(currentUser) => (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-dark-bg text-onsurface font-body">
          {/* Sidebar desktop */}
          <div className="hidden lg:block">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
          </div>

          {/* Mobile overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
              <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
            </div>
          )}

          {/* Main content */}
          <div
            className="transition-all duration-300"
            style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarCollapsed ? 72 : 240) : 0 }}
          >
            <Header
              onMenuToggle={() => setMobileMenuOpen(m => !m)}
              darkMode={darkMode}
              onToggleDark={() => setDarkMode(d => !d)}
            />
            <main className="p-4 md:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={
                    <Dashboard ordens={ordens} todasEtapas={todasEtapas} etapasDoSetor={etapasDoSetor} todasEtapasUnicas={todasEtapasUnicas} loading={loading} />
                  } />
                  <Route path="/kanban" element={
                    <Kanban
                      ordens={ordens} etapasDoSetor={etapasDoSetor} todasEtapas={todasEtapas} campos={campos}
                      vinculos={vinculos} criarVinculo={criarVinculo} profiles={profiles}
                      kanbanItems={kanbanItems} loadingKanban={loadingKanban}
                      onMoverStatus={moverStatus} onAdicionarSetor={adicionarSetor} onRemoverSetor={removerSetor}
                      onCarregarKanban={carregarKanban}
                      loading={loading}
                      onCriar={criar} onAtualizar={atualizar} onExcluir={excluir}
                    />
                  } />
                  <Route path="/ordens" element={
                    <OrdensServico
                      ordens={ordens} todasEtapas={todasEtapas} etapasDoSetor={etapasDoSetor} campos={campos}
                      vinculos={vinculos} criarVinculo={criarVinculo} profiles={profiles}
                      loading={loading}
                      onCriar={criar} onAtualizar={atualizar} onExcluir={excluir}
                      onAdicionarSetor={adicionarSetor} onRemoverSetor={removerSetor} onCarregarKanban={carregarKanban}
                    />
                  } />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/matrizes" element={
                    <Matrizes ordens={ordens} todasEtapas={todasEtapas} etapasDoSetor={etapasDoSetor} />
                  } />
                  <Route path="/config" element={
                    <Config
                      todasEtapas={todasEtapas} etapasDoSetor={etapasDoSetor} campos={campos} operadores={operadores} ordens={ordens}
                      onSalvarEtapasSetor={salvarSetor} onSalvarCampos={salvarCampos} onSalvarOperadores={salvarOperadores}
                    />
                  } />
                  <Route path="/usuarios" element={<Usuarios currentUser={currentUser} profiles={profiles} onSalvarProfile={salvarProfile} onCarregarProfiles={carregarProfiles} />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </ToastProvider>
    </BrowserRouter>
    )}
    </AuthGuard>
  )
}
