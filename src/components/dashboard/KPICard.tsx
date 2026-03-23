import { motion } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { staggerItem } from '@/hooks/useAnimations'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number
  icon: LucideIcon
  color: string
  suffix?: string
  decimals?: number
  subtitle?: string
}

export function KPICard({ title, value, icon: Icon, color, suffix = '', decimals = 0, subtitle }: KPICardProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="relative bg-dark-surface border border-dark-border rounded-xl p-5 overflow-hidden group cursor-default"
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}10, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-body font-semibold text-dark-muted uppercase tracking-wider">{title}</span>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15`, color }}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        <AnimatedCounter
          value={value}
          suffix={suffix}
          decimals={decimals}
          className="text-3xl font-bold text-white"
        />

        {subtitle && (
          <p className="text-xs text-dark-muted mt-1 font-body">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}
