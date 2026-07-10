import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  formatDueDateLabel,
  hasDueDate,
  shouldShowDueDateOriginal,
} from '@/utils/task'
import type { ExtractedTask } from '@/types/task'

interface DueDateDisplayProps {
  task: ExtractedTask
  className?: string
}

export function DueDateDisplay({ task, className }: DueDateDisplayProps) {
  const hasDate = hasDueDate(task.due_date)
  const showOriginal = shouldShowDueDateOriginal(task)

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5">
        {hasDate && (
          <Calendar className="size-3 shrink-0 text-muted" aria-hidden="true" />
        )}
        <span
          className={cn(
            'text-sm',
            hasDate ? 'font-medium text-foreground' : 'text-muted',
          )}
        >
          {formatDueDateLabel(task.due_date)}
        </span>
      </div>
      {showOriginal && (
        <p className="mt-0.5 text-xs text-muted">
          Original: &ldquo;{task.due_date_text}&rdquo;
        </p>
      )}
    </div>
  )
}
