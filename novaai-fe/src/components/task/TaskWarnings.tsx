import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskWarningsProps {
  warnings: string[]
  compact?: boolean
  className?: string
}

export function TaskWarnings({
  warnings,
  compact = false,
  className,
}: TaskWarningsProps) {
  if (warnings.length === 0) {
    return (
      <span className={cn('text-xs text-muted', className)}>—</span>
    )
  }

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-[var(--radius-badge)] border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning',
          className,
        )}
        title={warnings.join('\n')}
      >
        <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
        {warnings.length} conflict{warnings.length === 1 ? '' : 's'}
      </span>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {warnings.map((warning) => (
        <div
          key={warning}
          className="flex items-start gap-3 rounded-[var(--radius-badge)] border border-warning/20 bg-warning/5 px-3.5 py-3.5 text-xs leading-relaxed text-warning"
        >
          <AlertTriangle
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">{warning}</span>
        </div>
      ))}
    </div>
  )
}
