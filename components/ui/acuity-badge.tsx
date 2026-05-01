import { cn } from '@/lib/utils'
import type { AcuityLevel } from '@/lib/triage/mts-engine'
import { ACUITY_CONFIG } from '@/lib/triage/mts-engine'

interface AcuityBadgeProps {
  level: AcuityLevel
  className?: string
}

const COLOR_MAP: Record<AcuityLevel, string> = {
  1: 'bg-red-100 text-red-800 border-red-300',
  2: 'bg-orange-100 text-orange-800 border-orange-300',
  3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  4: 'bg-green-100 text-green-800 border-green-300',
  5: 'bg-purple-100 text-purple-800 border-purple-300',
}

export function AcuityBadge({ level, className }: AcuityBadgeProps) {
  const config = ACUITY_CONFIG[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold',
        COLOR_MAP[level],
        className
      )}
    >
      {config.emoji} {config.label}
    </span>
  )
}
