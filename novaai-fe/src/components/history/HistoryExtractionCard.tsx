import { Link } from 'react-router-dom'
import { ChevronRight, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/common'
import type { ExtractionSummary } from '@/types/history'
import { formatHistoryDate } from '@/utils/history'
import { HistoryMetaChips } from './HistoryMetaChips'
import { cn } from '@/lib/utils'

interface HistoryExtractionCardProps {
  extraction: ExtractionSummary
  deleting?: boolean
  onDelete: (id: string) => void
}

export function HistoryExtractionCard({
  extraction,
  deleting = false,
  onDelete,
}: HistoryExtractionCardProps) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-card)] border border-border/80',
        'bg-card/90 shadow-[var(--shadow-card)] backdrop-blur-sm',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[var(--shadow-card-hover)]',
      )}
    >
      <div
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary/70 via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0 flex-1 space-y-4">
          <HistoryMetaChips
            createdAt={formatHistoryDate(extraction.created_at)}
            taskCount={extraction.task_count}
            meetingDate={extraction.meeting_date}
          />

          <div className="space-y-2">
            <p className="line-clamp-3 text-sm leading-relaxed text-hero-subtitle sm:text-[0.9375rem]">
              {extraction.transcript_preview}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch lg:flex-row lg:items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={deleting}
            onClick={() => onDelete(extraction.id)}
            aria-label="Delete extraction"
            className="text-muted hover:text-danger"
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>

          <Link
            to={`/history/${extraction.id}`}
            className={cn(
              'inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-button)] px-4 text-sm font-medium',
              'bg-button-primary text-button-primary-foreground shadow-[var(--shadow-button-primary)]',
              'transition-transform hover:brightness-110 active:scale-[0.98]',
            )}
          >
            Open
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
