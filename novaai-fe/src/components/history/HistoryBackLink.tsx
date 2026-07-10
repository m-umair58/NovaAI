import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HistoryBackLink() {
  return (
    <Link
      to="/history"
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-full border border-border/80',
        'bg-surface/80 px-4 text-sm font-medium text-muted backdrop-blur-sm',
        'transition-colors hover:border-primary/25 hover:bg-hover hover:text-foreground',
      )}
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to History
    </Link>
  )
}
