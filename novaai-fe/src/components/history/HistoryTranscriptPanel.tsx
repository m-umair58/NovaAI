import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistoryTranscriptPanelProps {
  transcript: string
  className?: string
}

export function HistoryTranscriptPanel({
  transcript,
  className,
}: HistoryTranscriptPanelProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-border/80',
        'bg-card shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/80 bg-surface-container-low/80 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-[var(--radius-button)] bg-hero-accent/10 text-hero-accent">
          <FileText className="size-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-hero-foreground">
            Meeting Transcript
          </h2>
          <p className="text-xs text-hero-subtitle">Original source text</p>
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto px-5 py-4 sm:max-h-64">
        <p className="whitespace-pre-wrap font-mono text-[0.8125rem] leading-7 text-foreground/90">
          {transcript}
        </p>
      </div>
    </section>
  )
}
