import { useState, useEffect } from 'react'
import { Menu, Sun, Moon, Wifi, WifiOff } from 'lucide-react'
import { formatarDataExtenso } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  onMenuToggle: () => void
  darkMode: boolean
  onToggleDark: () => void
}

export function Header({ onMenuToggle, darkMode, onToggleDark }: HeaderProps) {
  const [dataAtual, setDataAtual] = useState(formatarDataExtenso())
  const [supaOk, setSupaOk] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setDataAtual(formatarDataExtenso()), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    supabase.from('etapas_kanban').select('id', { count: 'exact', head: true })
      .then(({ error }) => setSupaOk(!error))
  }, [])

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-surface/80 backdrop-blur-xl border-b border-dark-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-dark-muted hover:text-white hover:bg-dark-surface2 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm text-dark-muted font-body capitalize hidden sm:block">{dataAtual}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Status Supabase */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono ${
          supaOk ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {supaOk ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {supaOk ? 'Supabase' : 'Offline'}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg text-dark-muted hover:text-accent hover:bg-dark-surface2 transition-all"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  )
}
