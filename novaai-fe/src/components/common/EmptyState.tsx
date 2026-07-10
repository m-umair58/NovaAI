import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  title?: string
  description?: string
}

export function EmptyState({
  icon,
  title,
  description,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-1 flex-col items-center justify-center',
        'rounded-xl border border-dashed border-border bg-hover/30',
        'px-6 py-10 text-center',
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-muted shadow-sm">
          {icon}
        </div>
      )}
      {title && (
        <p className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </p>
      )}
      {description && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
