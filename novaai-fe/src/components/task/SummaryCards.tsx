import { AlertTriangle, Clock, ListTodo, UserCheck, UserMinus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTaskSummary } from '@/utils/task'
import type { ExtractedTask } from '@/types/task'

interface SummaryCardsProps {
  tasks: ExtractedTask[]
}

interface SummaryCardConfig {
  label: string
  value: number
  icon: LucideIcon
  iconClassName: string
}

function SummaryCard({ card }: { card: SummaryCardConfig }) {
  const Icon = card.icon

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3.5',
        'shadow-[var(--shadow-card)] sm:gap-3.5 sm:p-4',
      )}
    >
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-[var(--radius-badge)] text-white sm:size-9',
          card.iconClassName,
        )}
        aria-hidden="true"
      >
        <Icon className="size-4" strokeWidth={2} />
      </div>

      <div className="space-y-1.5">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">
          {card.label}
        </p>
        <p className="text-xl font-bold leading-none tracking-tight text-foreground sm:text-2xl">
          {card.value}
        </p>
      </div>
    </div>
  )
}

export function SummaryCards({ tasks }: SummaryCardsProps) {
  const summary = getTaskSummary(tasks)

  const cards: SummaryCardConfig[] = [
    {
      label: 'Total Tasks',
      value: summary.total,
      icon: ListTodo,
      iconClassName: 'bg-button-primary',
    },
    {
      label: 'Assigned',
      value: summary.assigned,
      icon: UserCheck,
      iconClassName: 'bg-success',
    },
    {
      label: 'Unassigned',
      value: summary.unassigned,
      icon: UserMinus,
      iconClassName: 'bg-warning',
    },
    {
      label: 'Needs Review',
      value: summary.withWarnings,
      icon: AlertTriangle,
      iconClassName: 'bg-danger',
    },
    {
      label: 'With Due Dates',
      value: summary.withDueDates,
      icon: Clock,
      iconClassName: 'bg-primary',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
      {cards.map((card) => (
        <SummaryCard key={card.label} card={card} />
      ))}
    </div>
  )
}
