import { ArrowRight, ClipboardList } from 'lucide-react'
import { Button } from '@/components/common'

interface EmptyResultsProps {
  onGetStarted?: () => void
}

export function EmptyResults({ onGetStarted }: EmptyResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-[var(--radius-card)] border border-border bg-primary/10 text-primary">
        <ClipboardList className="size-7" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        No Tasks Yet
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
        Paste a meeting transcript and click Extract Tasks to generate action
        items.
      </p>
      {onGetStarted && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-6"
          onClick={onGetStarted}
        >
          Get Started
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}
