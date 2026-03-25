import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Columns3, List, Calendar, Grid3X3, Settings, ChevronLeft, ChevronRight, Fuel
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/kanban', icon: Columns3, label: 'Kanban' },
  { to: '/ordens', icon: List, label: 'Ordens de Serviço' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/matrizes', icon: Grid3X3, label: 'Matrizes' },
  { to: '/config', icon: Settings, label: 'Configurações' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen bg-dark-surface border-r border-dark-border z-40 flex flex-col"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-dark-border">
        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Fuel className="w-5 h-5 text-accent" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-hidden"
          >
            <p className="font-display text-lg tracking-wider text-white leading-none">NOVA SÃO LUIZ</p>
            <p className="text-[10px] text-accent font-body font-semibold tracking-widest">DIESEL</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent/15 text-accent shadow-lg shadow-accent/5'
                  : 'text-dark-muted hover:text-white hover:bg-dark-surface2'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-dark-border text-dark-muted hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </motion.aside>
  )
}
