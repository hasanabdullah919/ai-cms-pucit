import { ComplaintStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: ComplaintStatus
  className?: string
}

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-[#fed255] text-[#735a00]',
  },
  assigned: {
    label: 'Assigned',
    className: 'bg-[#d4e3ff] text-[#1f477b]',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-[#e9ddff] text-[#21005d]',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-[#c3efda] text-[#005228]',
  },
  closed: {
    label: 'Closed',
    className: 'bg-[#e3e2e3] text-[#43474f]',
  },
  reopened: {
    label: 'Reopened',
    className: 'bg-[#ffdad6] text-[#93000a]',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  )
}
