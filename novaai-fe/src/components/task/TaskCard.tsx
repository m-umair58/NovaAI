import { User } from 'lucide-react'
import { DueDateDisplay } from './DueDateDisplay'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskWarnings } from './TaskWarnings'
import { cn } from '@/lib/utils'
import { getOwnerInitial, hasWarnings, isUnassignedOwner } from '@/utils/task'
import type { ExtractedTask } from '@/types/task'

interface TaskCardProps {
  task: ExtractedTask
}

export function TaskCard({ task }: TaskCardProps) {
  const unassigned = isUnassignedOwner(task.owner)
  const needsReview = hasWarnings(task)

  return (
    <article
      className={cn(
        'rounded-[var(--radius-card)] border bg-card p-5 shadow-[var(--shadow-card)]',
        needsReview
          ? 'border-warning/40 bg-warning/[0.02]'
          : 'border-border hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-relaxed text-foreground">
          {task.task}
        </p>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-background',
              unassigned
                ? 'bg-hover text-muted'
                : 'bg-primary/15 text-primary',
            )}
            aria-hidden="true"
          >
            {getOwnerInitial(task.owner)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              <User className="size-3" aria-hidden="true" />
              Owner
            </div>
            <p className="truncate text-sm font-medium text-foreground">
              {task.owner}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Due Date
          </p>
          <DueDateDisplay task={task} className="mt-0.5" />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Status
          </p>
          <TaskStatusBadge task={task} className="mt-1" />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Conflicts
          </p>
          <TaskWarnings warnings={task.warnings} />
        </div>
      </div>
    </article>
  )
}
