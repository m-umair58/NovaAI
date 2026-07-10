import { useState } from 'react'
import { toast } from 'sonner'
import {
  extractTranscript,
  TranscriptExtractionError,
} from '@/api/transcript.api'
import { TranscriptInput } from '@/components/transcript'
import { ExtractionProgress, TaskDashboard } from '@/components/task'
import { PageHeader } from '@/components/common'
import { AppLayout } from '@/layouts'
import { sampleTranscripts } from '@/mocks/transcripts'
import { getTaskSummary } from '@/utils/task'
import type { ExtractedTask } from '@/types/task'
import { cn } from '@/lib/utils'

export default function Home() {
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([])

  const hasResults = extractedTasks.length > 0

  const handleTranscriptSubmit = async (
    transcript: string,
    meetingDate?: string,
  ) => {
    setIsExtracting(true)
    setExtractedTasks([])

    try {
      const { tasks, extractionId } = await extractTranscript(transcript, meetingDate)
      setExtractedTasks(tasks)

      const summary = getTaskSummary(tasks)
      if (summary.withWarnings > 0) {
        toast.warning(
          `Extracted ${summary.total} task${summary.total === 1 ? '' : 's'}. ${summary.withWarnings} need review due to conflicts or ambiguities.`,
        )
      } else {
        toast.success(
          `Successfully extracted ${summary.total} task${summary.total === 1 ? '' : 's'}.`,
        )
      }

      if (extractionId) {
        toast.message('Saved to history.')
      }
    } catch (error) {
      const message =
        error instanceof TranscriptExtractionError
          ? error.message
          : 'Failed to analyze transcript. Please try again.'
      toast.error(message)
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <AppLayout>
      <div
        className="flex min-h-0 w-full flex-1 flex-col items-center gap-8"
        id="dashboard"
      >
        <PageHeader
          title={
            <>
              <span className="block">Turn meeting chaos into</span>
              <span className="block text-hero-accent">executable tasks.</span>
            </>
          }
          subtitle="Paste your raw transcript and let our AI engine handle the heavy lifting. We extract owners, deadlines, and priorities with intelligent precision."
        />

        <div
          className={cn(
            'flex min-h-0 w-full flex-1',
            hasResults
              ? 'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch lg:gap-8'
              : 'mx-auto max-w-2xl',
          )}
        >
          <div className="relative flex h-full min-h-[480px] flex-1 flex-col">
            <TranscriptInput
              loading={isExtracting}
              onSubmit={handleTranscriptSubmit}
              sampleTranscripts={sampleTranscripts}
              className="h-full"
            />
            {isExtracting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <ExtractionProgress fill className="h-full w-full" />
              </div>
            )}
          </div>

          {hasResults && (
            <TaskDashboard
              tasks={extractedTasks}
              loading={isExtracting}
              className="h-full min-h-[480px]"
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
