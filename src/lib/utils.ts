import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function diasDesdeEntrada(dataEntrada: string): number {
  try {
    return differenceInDays(new Date(), parseISO(dataEntrada))
  } catch {
    return 0
  }
}

export function badgeDias(dias: number): { cor: string; bg: string } {
  if (dias >= 7) return { cor: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' }
  if (dias >= 4) return { cor: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' }
  return { cor: 'text-green-400', bg: 'bg-green-500/15 border-green-500/30' }
}

export function formatarData(data: string): string {
  try {
    return format(parseISO(data), "dd/MM/yyyy", { locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatarDataHora(data: string): string {
  try {
    return format(parseISO(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatarDataExtenso(): string {
  return format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function gerarNumeroOS(): string {
  const ano = new Date().getFullYear()
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `OS-${ano}-${seq}`
}
