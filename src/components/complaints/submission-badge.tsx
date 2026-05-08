import { cn } from '@/lib/utils'

interface SubmissionBadgeProps {
  isAnonymous: boolean
  userId: string | null
  email: string | null
  className?: string
}

export function SubmissionBadge({ isAnonymous, userId, email, className }: SubmissionBadgeProps) {
  let label = 'Anonymous'
  let badgeClass = 'bg-gray-100 text-gray-800 border-gray-200'

  if (!isAnonymous) {
    if (userId) {
      label = 'Registered'
      badgeClass = 'bg-green-100 text-green-800 border-green-200'
    } else if (email) {
      label = 'Guest'
      badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        badgeClass,
        className
      )}
    >
      {label}
    </span>
  )
}
