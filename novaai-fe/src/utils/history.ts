import type { ExtractionDetail } from '@/types/history'
import type { ExtractedTask } from '@/types/task'
import { normalizePriority } from '@/utils/task'

export function mapStoredItemsToTasks(
  items: ExtractionDetail['action_items'],
): ExtractedTask[] {
  return items.map((item) => ({
    id: item.id,
    task: item.task,
    owner: item.owner,
    due_date: item.due_date ?? item.due_date_text ?? 'No date given',
    due_date_text: item.due_date_text,
    priority: normalizePriority(item.priority),
    warnings: item.warnings ?? [],
  }))
}

export function formatHistoryDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
