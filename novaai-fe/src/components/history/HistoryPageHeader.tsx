import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface HistoryPageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function HistoryPageHeader({
  title,
  subtitle,
  action,
  className,
}: HistoryPageHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-card)] border border-border/80',
        'bg-gradient-to-br from-surface via-surface to-surface-container-low',
        'px-6 py-7 shadow-[var(--shadow-card)] sm:px-8 sm:py-8',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            NOVA AI · History
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </div>
  )
}
