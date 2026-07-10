import { Link } from 'react-router-dom'
import { ArrowRight, History } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HistoryEmptyState() {
  return (
    <div
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center overflow-hidden',
        'rounded-[var(--radius-card)] border border-dashed border-border/90',
        'bg-gradient-to-b from-surface-container-low/50 to-surface px-6 py-20 text-center',
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.08),transparent_55%)]"
        aria-hidden="true"
      />

      <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-[var(--shadow-card)]">
        <History className="size-7" aria-hidden="true" />
      </div>

      <h2 className="relative text-xl font-semibold tracking-tight text-foreground">
        No extractions saved yet
      </h2>
      <p className="relative mt-2 max-w-md text-sm leading-relaxed text-muted">
        Run your first transcript extraction on the dashboard. Saved sessions
        will show up here automatically.
      </p>

      <Link
        to="/"
        className={cn(
          'relative mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-button)] px-5 text-sm font-medium',
          'bg-button-primary text-button-primary-foreground shadow-[var(--shadow-button-primary)]',
          'transition-transform hover:brightness-110 active:scale-[0.98]',
        )}
      >
        Go to Dashboard
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
