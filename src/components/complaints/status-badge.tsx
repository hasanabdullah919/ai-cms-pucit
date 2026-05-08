import { ComplaintStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: ComplaintStatus
  className?: string
}

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  assigned: { label: 'Assigned', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800 border-green-200' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-800 border-gray-200' },
  reopened: { label: 'Reopened', className: 'bg-orange-100 text-orange-800 border-orange-200' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
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
