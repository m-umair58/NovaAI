import { useMemo, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { sendToTracker, TrackerSendError } from '@/api/tracker.api'
import { Button } from '@/components/common'
import { EmptyResults } from './EmptyResults'
import { ExtractionAlerts } from './ExtractionAlerts'
import { SummaryCards } from './SummaryCards'
import { TaskTable } from './TaskTable'
import { TaskToolbar } from './TaskToolbar'
import {
  filterTasks,
  getTaskSummary,
  getUniqueOwners,
  sortTasks,
  type OwnerFilter,
  type PriorityFilter,
  type SortOption,
  type WarningFilter,
} from '@/utils/task'
import type { ExtractedTask } from '@/types/task'
import { cn } from '@/lib/utils'

export interface TaskDashboardProps {
  tasks: ExtractedTask[]
  loading: boolean
  className?: string
}

export function TaskDashboard({ tasks, loading, className }: TaskDashboardProps) {
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all')
  const [warningFilter, setWarningFilter] = useState<WarningFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [sort, setSort] = useState<SortOption>('default')
  const [isSending, setIsSending] = useState(false)

  const owners = useMemo(() => getUniqueOwners(tasks), [tasks])
  const summary = useMemo(() => getTaskSummary(tasks), [tasks])

  const filteredTasks = useMemo(() => {
    const filtered = filterTasks(
      tasks,
      search,
      ownerFilter,
      warningFilter,
      priorityFilter,
    )
    return sortTasks(filtered, sort)
  }, [tasks, search, ownerFilter, warningFilter, priorityFilter, sort])

  const showEmptyState = !loading && tasks.length === 0
  const showTable = loading || tasks.length > 0

  const handleGetStarted = () => {
    document.getElementById('meeting-transcript')?.focus()
  }

  const handleSendToTracker = async () => {
    if (tasks.length === 0) return

    setIsSending(true)
    try {
      const message = await sendToTracker(tasks)
      toast.success(message)
    } catch (error) {
      const errorMessage =
        error instanceof TrackerSendError
          ? error.message
          : 'Failed to send tasks to tracker. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div
      id="task-dashboard"
      className={cn('flex h-full min-h-0 flex-1 flex-col gap-4', className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Extracted Tasks
          </h2>
          <p className="text-sm text-muted">
            {summary.total} task{summary.total === 1 ? '' : 's'} found
            {filteredTasks.length !== summary.total &&
              ` · showing ${filteredTasks.length}`}
          </p>
        </div>

        {tasks.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            disabled={loading || isSending}
            onClick={handleSendToTracker}
            className="shrink-0"
          >
            {isSending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-4" aria-hidden="true" />
                Send to Tracker
              </>
            )}
          </Button>
        )}
      </div>

      <SummaryCards tasks={tasks} />
      <ExtractionAlerts tasks={tasks} />

      <TaskToolbar
        search={search}
        ownerFilter={ownerFilter}
        warningFilter={warningFilter}
        priorityFilter={priorityFilter}
        sort={sort}
        owners={owners}
        onSearchChange={setSearch}
        onOwnerFilterChange={setOwnerFilter}
        onWarningFilterChange={setWarningFilter}
        onPriorityFilterChange={setPriorityFilter}
        onSortChange={setSort}
      />

      {showEmptyState && (
        <div className="flex flex-1 items-center justify-center rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
          <EmptyResults onGetStarted={handleGetStarted} />
        </div>
      )}

      {showTable && (
        <div className="flex min-h-0 flex-1 flex-col">
          <TaskTable tasks={filteredTasks} loading={loading} />
        </div>
      )}
    </div>
  )
}
