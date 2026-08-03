import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function stageBadgeVariant(stage: string) {
  const map: Record<string, string> = {
    'Intake': 'intake',
    'Docs Collection': 'docs',
    'Review': 'review',
    'Submitted': 'submitted',
    'Decision': 'decision',
    'Closed': 'closed',
  }
  return (map[stage] ?? 'default') as any
}
