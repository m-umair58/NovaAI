import { isAxiosError } from 'axios'
import api from './axios'
import type { ExtractedTask } from '@/types/task'
import { toActionItemPayload } from '@/utils/task'

interface TrackerResponse {
  success: boolean
  message: string
}

interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
  }
}

export class TrackerSendError extends Error {
  constructor(message = 'Failed to send tasks to tracker.') {
    super(message)
    this.name = 'TrackerSendError'
  }
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return (
      error.response?.data?.error?.message ??
      'Failed to send tasks to tracker. Please try again.'
    )
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Failed to send tasks to tracker. Please try again.'
}

export async function sendToTracker(tasks: ExtractedTask[]): Promise<string> {
  try {
    const { data } = await api.post<TrackerResponse>(
      '/action-items/send-to-tracker',
      { action_items: tasks.map(toActionItemPayload) },
    )
    return data.message
  } catch (error) {
    throw new TrackerSendError(getErrorMessage(error))
  }
}
