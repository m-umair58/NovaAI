import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExtractionProgressProps {
  className?: string
  fill?: boolean
}

export function ExtractionProgress({
  className,
  fill = false,
}: ExtractionProgressProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center',
        fill &&
          'rounded-[var(--radius-card)] border border-border bg-surface/95 shadow-[var(--shadow-card)] backdrop-blur-sm',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Analyzing meeting transcript"
    >
      <div
        className={cn(
          'flex w-full max-w-sm flex-col items-center px-6 py-8',
          !fill &&
            'rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]',
        )}
      >
        <div
          className="mb-4 grid size-14 shrink-0 place-items-center rounded-[var(--radius-card)] border border-primary/20 bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Bot
            className="size-6 translate-x-px animate-pulse"
            strokeWidth={1.75}
          />
        </div>

        <h2 className="w-full text-center text-lg font-semibold tracking-tight text-foreground">
          Analyzing meeting transcript...
        </h2>
        <p className="mt-2 w-full text-center text-sm leading-relaxed text-muted">
          Please wait while AI extracts action items.
        </p>

        <div className="mt-6 flex w-full max-w-xs justify-center">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="mx-auto h-full w-1/3 animate-pulse rounded-full bg-primary/60" />
          </div>
        </div>
      </div>
    </div>
  )
}
