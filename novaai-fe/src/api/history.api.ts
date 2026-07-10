import { isAxiosError } from 'axios'
import api from './axios'
import type { ExtractionDetail, ExtractionListResponse } from '@/types/history'
import type { ExtractedTask } from '@/types/task'
import { toActionItemPayload } from '@/utils/task'

interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
  }
}

export class HistoryError extends Error {
  constructor(message = 'Failed to load history.') {
    super(message)
    this.name = 'HistoryError'
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error?.message ?? fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

export async function listExtractions(limit = 50): Promise<ExtractionListResponse> {
  try {
    const { data } = await api.get<ExtractionListResponse>('/history', {
      params: { limit },
    })
    return data
  } catch (error) {
    throw new HistoryError(
      getErrorMessage(error, 'Failed to load extraction history.'),
    )
  }
}

export async function getExtraction(id: string): Promise<ExtractionDetail> {
  try {
    const { data } = await api.get<ExtractionDetail>(`/history/${id}`)
    return data
  } catch (error) {
    throw new HistoryError(
      getErrorMessage(error, 'Failed to load extraction details.'),
    )
  }
}

export async function deleteExtraction(id: string): Promise<void> {
  try {
    await api.delete(`/history/${id}`)
  } catch (error) {
    throw new HistoryError(
      getErrorMessage(error, 'Failed to delete extraction.'),
    )
  }
}

interface SaveExtractionResponse {
  extraction_id: string
}

export async function saveExtraction(
  transcript: string,
  tasks: ExtractedTask[],
  meetingDate?: string,
  extractionId?: string,
): Promise<string> {
  const payload = {
    transcript,
    meeting_date: meetingDate,
    action_items: tasks.map(toActionItemPayload),
  }

  try {
    if (extractionId) {
      const { data } = await api.put<SaveExtractionResponse>(
        `/history/${extractionId}`,
        payload,
      )
      return data.extraction_id
    }

    const { data } = await api.post<SaveExtractionResponse>('/history', payload)
    return data.extraction_id
  } catch (error) {
    throw new HistoryError(
      getErrorMessage(error, 'Failed to save extraction to history.'),
    )
  }
}
