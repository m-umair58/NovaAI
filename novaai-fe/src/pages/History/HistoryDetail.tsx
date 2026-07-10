import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getExtraction, HistoryError } from '@/api/history.api'
import { PageHeader } from '@/components/common'
import {
  HistoryBackLink,
  HistoryMetaChips,
  HistoryTranscriptPanel,
} from '@/components/history'
import { TaskDashboard } from '@/components/task'
import { AppLayout } from '@/layouts'
import type { ExtractionDetail } from '@/types/history'
import type { ExtractedTask } from '@/types/task'
import { formatHistoryDate, mapStoredItemsToTasks } from '@/utils/history'

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<ExtractionDetail | null>(null)
  const [tasks, setTasks] = useState<ExtractedTask[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const loading = Boolean(id) && isFetching

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const fetchDetail = async () => {
      try {
        const data = await getExtraction(id)
        if (cancelled) return
        setDetail(data)
        setTasks(mapStoredItemsToTasks(data.action_items))
      } catch (error) {
        if (cancelled) return
        const message =
          error instanceof HistoryError
            ? error.message
            : 'Failed to load extraction details.'
        toast.error(message)
      } finally {
        if (!cancelled) {
          setIsFetching(false)
        }
      }
    }

    void fetchDetail()

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <AppLayout>
      <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-8">
        <div className="w-full">
          <HistoryBackLink />
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <span className="sr-only">Loading extraction...</span>
          </div>
        ) : !detail ? (
          <div className="w-full rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-8 py-16 text-center">
            <p className="text-sm text-muted">Extraction not found.</p>
          </div>
        ) : (
          <>
            <PageHeader
              title={
                <>
                  Past <span className="text-hero-accent">Extraction</span>
                </>
              }
              subtitle="Reopen a saved analysis with its original transcript and extracted action items."
              action={
                <HistoryMetaChips
                  createdAt={formatHistoryDate(detail.created_at)}
                  taskCount={detail.task_count}
                  meetingDate={detail.meeting_date}
                  className="justify-center"
                />
              }
            />

            <div className="flex w-full flex-col gap-6 lg:gap-8">
              <HistoryTranscriptPanel transcript={detail.transcript} />

              <section className="rounded-[var(--radius-card)] border border-border/80 bg-surface/50 p-1 shadow-[var(--shadow-card)]">
                <TaskDashboard
                  tasks={tasks}
                  loading={false}
                  onTasksChange={setTasks}
                  className="min-h-[480px] p-4 sm:p-5"
                />
              </section>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
