import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { deleteExtraction, HistoryError, listExtractions } from '@/api/history.api'
import { PageHeader } from '@/components/common'
import {
  HistoryEmptyState,
  HistoryExtractionCard,
  HistoryLoadingState,
} from '@/components/history'
import { AppLayout } from '@/layouts'

export default function HistoryPage() {
  const [extractions, setExtractions] = useState<Awaited<
    ReturnType<typeof listExtractions>
  >['extractions']>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchHistory = async () => {
      try {
        const data = await listExtractions()
        if (cancelled) return
        setExtractions(data.extractions)
      } catch (error) {
        if (cancelled) return
        const message =
          error instanceof HistoryError
            ? error.message
            : 'Failed to load extraction history.'
        toast.error(message)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchHistory()

    return () => {
      cancelled = true
    }
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
      <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-8">
        <PageHeader
          title={
            <>
              <span>Extraction </span>
              <span className="text-hero-accent">History</span>
            </>
          }
          subtitle="Review saved meeting analyses, reopen past results, and manage your extraction archive."
          action={
            !loading && extractions.length > 0 ? (
              <div className="inline-flex items-center rounded-full border border-hero-accent/20 bg-hero-accent/10 px-4 py-2 text-sm font-semibold text-hero-accent">
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
          <div className="grid w-full gap-4">
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
