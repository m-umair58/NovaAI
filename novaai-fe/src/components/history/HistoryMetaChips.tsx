import type { ReactNode } from 'react'
import { Calendar, FileText, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistoryMetaChipProps {
  icon: ReactNode
  label: string
  className?: string
}

function HistoryMetaChip({ icon, label, className }: HistoryMetaChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border/70',
        'bg-surface/80 px-2.5 py-1 text-xs font-medium text-muted backdrop-blur-sm',
        className,
      )}
    >
      {icon}
      {label}
    </span>
  )
}

interface HistoryMetaChipsProps {
  createdAt: string
  taskCount: number
  meetingDate?: string | null
  className?: string
}

export function HistoryMetaChips({
  createdAt,
  taskCount,
  meetingDate,
  className,
}: HistoryMetaChipsProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <HistoryMetaChip
        icon={<Calendar className="size-3.5 text-primary" aria-hidden="true" />}
        label={createdAt}
      />
      {meetingDate && (
        <HistoryMetaChip
          icon={<FileText className="size-3.5 text-primary" aria-hidden="true" />}
          label={`Meeting ${meetingDate}`}
        />
      )}
      <HistoryMetaChip
        icon={<ListTodo className="size-3.5 text-primary" aria-hidden="true" />}
        label={`${taskCount} task${taskCount === 1 ? '' : 's'}`}
      />
    </div>
  )
}
