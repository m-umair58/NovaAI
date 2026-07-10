import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { deleteExtraction, HistoryError, listExtractions } from '@/api/history.api'
import {
  HistoryEmptyState,
  HistoryExtractionCard,
  HistoryLoadingState,
  HistoryPageHeader,
} from '@/components/history'
import { AppLayout } from '@/layouts'

export default function HistoryPage() {
  const [extractions, setExtractions] = useState<Awaited<
    ReturnType<typeof listExtractions>
  >['extractions']>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await listExtractions()
      setExtractions(data.extractions)
    } catch (error) {
      const message =
        error instanceof HistoryError
          ? error.message
          : 'Failed to load extraction history.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadHistory()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteExtraction(id)
      setExtractions((current) => current.filter((item) => item.id !== id))
      toast.success('Extraction deleted.')
    } catch (error) {
      const message =
        error instanceof HistoryError
          ? error.message
          : 'Failed to delete extraction.'
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppLayout>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-6 lg:gap-8">
        <HistoryPageHeader
          title="Extraction History"
          subtitle="Review saved meeting analyses, reopen past results, and manage your extraction archive."
          action={
            !loading && extractions.length > 0 ? (
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                {extractions.length} saved
              </div>
            ) : undefined
          }
        />

        {loading ? (
          <HistoryLoadingState />
        ) : extractions.length === 0 ? (
          <HistoryEmptyState />
        ) : (
          <div className="grid gap-4">
            {extractions.map((extraction) => (
              <HistoryExtractionCard
                key={extraction.id}
                extraction={extraction}
                deleting={deletingId === extraction.id}
                onDelete={(id) => void handleDelete(id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
