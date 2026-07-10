import { isAxiosError } from 'axios'
import api from './axios'
import type { ExtractedTask } from '@/types/task'
import { normalizePriority } from '@/utils/task'

interface ActionItemResponse {
  task: string
  owner: string
  due_date: string | null
  due_date_text: string
  priority: string
  warnings: string[]
}

export interface ExtractResult {
  tasks: ExtractedTask[]
  extractionId?: string
}

interface ExtractionResponse {
  action_items: ActionItemResponse[]
  count: number
  extraction_id?: string | null
}

interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
  }
}

export class TranscriptExtractionError extends Error {
  constructor(message = 'Failed to analyze transcript.') {
    super(message)
    this.name = 'TranscriptExtractionError'
  }
}

function mapActionItemToTask(item: ActionItemResponse): ExtractedTask {
  return {
    id: crypto.randomUUID(),
    task: item.task,
    owner: item.owner,
    due_date: item.due_date ?? item.due_date_text ?? 'No date given',
    due_date_text: item.due_date_text,
    priority: normalizePriority(item.priority),
    warnings: item.warnings ?? [],
  }
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return (
      error.response?.data?.error?.message ??
      'Failed to analyze transcript. Please try again.'
    )
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Failed to analyze transcript. Please try again.'
}

export async function extractTranscript(
  transcript: string,
  meetingDate?: string,
): Promise<ExtractResult> {
  try {
    const payload: { transcript: string; meeting_date?: string } = { transcript }
    if (meetingDate) {
      payload.meeting_date = meetingDate
    }

    const { data } = await api.post<ExtractionResponse>(
      '/action-items/extract',
      payload,
    )
    return {
      tasks: data.action_items.map(mapActionItemToTask),
      extractionId: data.extraction_id ?? undefined,
    }
  } catch (error) {
    throw new TranscriptExtractionError(getErrorMessage(error))
  }
}
