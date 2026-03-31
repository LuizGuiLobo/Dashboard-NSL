import { useState, useEffect } from 'react'
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
import { useOrdens, useEtapas, useCampos, useOperadores, useVinculos } from '@/hooks/useSupabase'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { ordens, loading: loadingOS, criar, atualizar, excluir } = useOrdens()
  const { todasEtapas, loading: loadingEtapas, etapasDoSetor, todasEtapasUnicas, salvarSetor, carregar: carregarEtapas } = useEtapas()
  const { campos, loading: loadingCampos, salvar: salvarCampos } = useCampos()
  const { operadores, loading: loadingOps, salvar: salvarOperadores } = useOperadores()
  const { vinculos, criar: criarVinculo } = useVinculos()

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
                      ordens={ordens} etapasDoSetor={etapasDoSetor} todasEtapas={todasEtapas} campos={campos} operadores={operadores}
                      vinculos={vinculos} criarVinculo={criarVinculo}
                      loading={loading}
                      onCriar={criar} onAtualizar={atualizar} onExcluir={excluir}
                    />
                  } />
                  <Route path="/ordens" element={
                    <OrdensServico
                      ordens={ordens} todasEtapas={todasEtapas} etapasDoSetor={etapasDoSetor} campos={campos} operadores={operadores}
                      vinculos={vinculos} criarVinculo={criarVinculo}
                      loading={loading}
                      onCriar={criar} onAtualizar={atualizar} onExcluir={excluir}
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
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
