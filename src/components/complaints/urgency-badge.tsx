import { UrgencyLevel } from '@/types'
import { cn } from '@/lib/utils'

interface UrgencyBadgeProps {
  urgency: UrgencyLevel
  className?: string
}

const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-200' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  low: { label: 'Low', className: 'bg-green-100 text-green-800 border-green-200' },
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const config = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.medium
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
