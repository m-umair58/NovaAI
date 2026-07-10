import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
}

export function Card({
  hover = true,
  glass = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-border text-card-foreground',
        glass ? 'bg-surface shadow-[var(--shadow-card)]' : 'bg-card shadow-[var(--shadow-card)]',
        hover && 'transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-b border-border px-6 py-5', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  )
}
