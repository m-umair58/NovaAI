import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTaskSummary } from '@/utils/task'
import type { ExtractedTask } from '@/types/task'

interface ExtractionAlertsProps {
  tasks: ExtractedTask[]
  className?: string
}

export function ExtractionAlerts({ tasks, className }: ExtractionAlertsProps) {
  const summary = getTaskSummary(tasks)

  if (summary.withWarnings === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-card)] border border-warning/30 bg-warning/5 px-4 py-3',
        className,
      )}
      role="status"
    >
      <AlertTriangle
        className="mt-0.5 size-4 shrink-0 text-warning"
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {summary.withWarnings} task
          {summary.withWarnings === 1 ? '' : 's'} need review
        </p>
        <p className="text-xs leading-relaxed text-muted">
          Conflicts or ambiguities were detected in owner, due date, priority, or
          task details. Review the highlighted items before sending to your
          tracker.
        </p>
      </div>
    </div>
  )
}
