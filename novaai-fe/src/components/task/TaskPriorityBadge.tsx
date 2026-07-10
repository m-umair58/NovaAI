import { Badge } from '@/components/common'
import { cn } from '@/lib/utils'
import { isSpecifiedPriority } from '@/utils/task'
import type { TaskPriority } from '@/types/task'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

const priorityVariant: Record<
  TaskPriority,
  'default' | 'danger' | 'warning' | 'primary'
> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'primary',
  'Not specified': 'default',
}

export function TaskPriorityBadge({
  priority,
  className,
}: TaskPriorityBadgeProps) {
  if (!isSpecifiedPriority(priority)) {
    return (
      <span className={cn('text-xs text-muted', className)}>Not specified</span>
    )
  }

  return (
    <Badge variant={priorityVariant[priority]} className={className}>
      {priority}
    </Badge>
  )
}
