import { cn } from '@/lib/utils'
import { hasDueDate, isUnassignedOwner } from '@/utils/task'
import type { ExtractedTask } from '@/types/task'

interface TaskStatusBadgeProps {
  task: ExtractedTask
  className?: string
}

type BadgeTone = 'assigned' | 'unassigned' | 'due-date' | 'no-due-date'

const toneStyles: Record<BadgeTone, string> = {
  assigned: 'border-success/30 bg-success/10 text-success',
  unassigned: 'border-border bg-background text-muted',
  'due-date': 'border-primary/30 bg-primary/5 text-primary',
  'no-due-date': 'border-warning/30 bg-warning/5 text-warning',
}

function StatusPill({
  tone,
  label,
}: {
  tone: BadgeTone
  label: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-badge)] border px-2 py-0.5 text-xs font-medium',
        toneStyles[tone],
      )}
    >
      {label}
    </span>
  )
}

export function TaskStatusBadge({ task, className }: TaskStatusBadgeProps) {
  const assigned = !isUnassignedOwner(task.owner)
  const dueDateExists = hasDueDate(task.due_date)

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      <StatusPill
        tone={assigned ? 'assigned' : 'unassigned'}
        label={assigned ? 'Assigned' : 'Unassigned'}
      />
      <StatusPill
        tone={dueDateExists ? 'due-date' : 'no-due-date'}
        label={dueDateExists ? 'Due Date' : 'No Due Date'}
      />
    </div>
  )
}
