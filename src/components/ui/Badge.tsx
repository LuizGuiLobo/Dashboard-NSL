import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  className?: string
  variant?: 'solid' | 'outline'
}

export function Badge({ children, color, className, variant = 'solid' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold font-body whitespace-nowrap',
        variant === 'solid'
          ? 'text-white/90'
          : 'border',
        className
      )}
      style={
        color
          ? variant === 'solid'
            ? { backgroundColor: `${color}22`, color: color, border: `1px solid ${color}44` }
            : { borderColor: `${color}44`, color: color }
          : undefined
      }
    >
      {children}
    </span>
  )
}
