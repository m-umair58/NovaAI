import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getExtraction, HistoryError } from '@/api/history.api'
import {
  HistoryBackLink,
  HistoryMetaChips,
  HistoryPageHeader,
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const loadDetail = async () => {
      setLoading(true)
      try {
        const data = await getExtraction(id)
        setDetail(data)
        setTasks(mapStoredItemsToTasks(data.action_items))
      } catch (error) {
        const message =
          error instanceof HistoryError
            ? error.message
            : 'Failed to load extraction details.'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    void loadDetail()
  }, [id])

  return (
    <AppLayout>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-6 lg:gap-8">
        <HistoryBackLink />

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <span className="sr-only">Loading extraction...</span>
          </div>
        ) : !detail ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-8 py-16 text-center">
            <p className="text-sm text-muted">Extraction not found.</p>
          </div>
        ) : (
          <>
            <HistoryPageHeader
              title="Past Extraction"
              subtitle="Reopen a saved analysis with its original transcript and extracted action items."
              action={
                <HistoryMetaChips
                  createdAt={formatHistoryDate(detail.created_at)}
                  taskCount={detail.task_count}
                  meetingDate={detail.meeting_date}
                  className="sm:justify-end"
                />
              }
            />

            <HistoryTranscriptPanel transcript={detail.transcript} />

            <section className="rounded-[var(--radius-card)] border border-border/80 bg-surface/50 p-1 shadow-[var(--shadow-card)]">
              <TaskDashboard tasks={tasks} loading={false} className="min-h-[480px] p-4 sm:p-5" />
            </section>
          </>
        )}
      </div>
    </AppLayout>
  )
}
