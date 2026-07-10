import type { ExtractedTask, TaskPriority } from '@/types/task'

export const UNASSIGNED_OWNER = 'Unassigned'
export const NO_DUE_DATE = 'No date given'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const PRIORITY_ORDER: Record<TaskPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
  'Not specified': 3,
}

export type OwnerFilter = 'all' | 'unassigned' | string
export type WarningFilter = 'all' | 'with_warnings' | 'no_warnings'
export type PriorityFilter = 'all' | TaskPriority
export type SortOption =
  | 'default'
  | 'owner'
  | 'due_date'
  | 'task_name'
  | 'priority'

export interface TaskSummary {
  total: number
  assigned: number
  unassigned: number
  withDueDates: number
  withWarnings: number
  highPriority: number
}

export function isUnassignedOwner(owner: string): boolean {
  return owner === UNASSIGNED_OWNER
}

export function hasDueDate(dueDate: string): boolean {
  return dueDate !== NO_DUE_DATE
}

export function hasWarnings(task: ExtractedTask): boolean {
  return task.warnings.length > 0
}

export function isSpecifiedPriority(priority: TaskPriority): boolean {
  return priority !== 'Not specified'
}

export function normalizePriority(priority: string): TaskPriority {
  const priorities: TaskPriority[] = ['High', 'Medium', 'Low', 'Not specified']
  return (
    priorities.find(
      (value) => value.toLowerCase() === priority.toLowerCase(),
    ) ?? 'Not specified'
  )
}

export function getOwnerInitial(owner: string): string {
  if (isUnassignedOwner(owner)) return '?'
  return owner.charAt(0).toUpperCase()
}

export function formatDueDateLabel(dueDate: string): string {
  if (!hasDueDate(dueDate)) return NO_DUE_DATE

  if (ISO_DATE_REGEX.test(dueDate)) {
    return new Date(`${dueDate}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return dueDate
}

export function shouldShowDueDateOriginal(task: ExtractedTask): boolean {
  return (
    hasDueDate(task.due_date) &&
    task.due_date_text !== task.due_date &&
    task.due_date_text !== NO_DUE_DATE
  )
}

export function getTaskSummary(tasks: ExtractedTask[]): TaskSummary {
  return {
    total: tasks.length,
    assigned: tasks.filter((task) => !isUnassignedOwner(task.owner)).length,
    unassigned: tasks.filter((task) => isUnassignedOwner(task.owner)).length,
    withDueDates: tasks.filter((task) => hasDueDate(task.due_date)).length,
    withWarnings: tasks.filter((task) => hasWarnings(task)).length,
    highPriority: tasks.filter((task) => task.priority === 'High').length,
  }
}

export function getUniqueOwners(tasks: ExtractedTask[]): string[] {
  const owners = new Set(
    tasks.map((task) => task.owner).filter((owner) => !isUnassignedOwner(owner)),
  )
  return Array.from(owners).sort((a, b) => a.localeCompare(b))
}

export function filterTasks(
  tasks: ExtractedTask[],
  search: string,
  ownerFilter: OwnerFilter,
  warningFilter: WarningFilter = 'all',
  priorityFilter: PriorityFilter = 'all',
): ExtractedTask[] {
  const query = search.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchesSearch =
      query.length === 0 || task.task.toLowerCase().includes(query)

    const matchesOwner =
      ownerFilter === 'all' ||
      (ownerFilter === 'unassigned' && isUnassignedOwner(task.owner)) ||
      task.owner === ownerFilter

    const matchesWarnings =
      warningFilter === 'all' ||
      (warningFilter === 'with_warnings' && hasWarnings(task)) ||
      (warningFilter === 'no_warnings' && !hasWarnings(task))

    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter

    return matchesSearch && matchesOwner && matchesWarnings && matchesPriority
  })
}

export function sortTasks(
  tasks: ExtractedTask[],
  sort: SortOption,
): ExtractedTask[] {
  const sorted = [...tasks]

  switch (sort) {
    case 'owner':
      return sorted.sort((a, b) => a.owner.localeCompare(b.owner))
    case 'due_date':
      return sorted.sort((a, b) => {
        const aHasDate = hasDueDate(a.due_date)
        const bHasDate = hasDueDate(b.due_date)
        if (aHasDate && !bHasDate) return -1
        if (!aHasDate && bHasDate) return 1
        return a.due_date.localeCompare(b.due_date)
      })
    case 'task_name':
      return sorted.sort((a, b) => a.task.localeCompare(b.task))
    case 'priority':
      return sorted.sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
      )
    default:
      return sorted
  }
}

export function toActionItemPayload(task: ExtractedTask) {
  return {
    task: task.task,
    owner: task.owner,
    due_date: hasDueDate(task.due_date) ? task.due_date : null,
    due_date_text: task.due_date_text,
    priority: task.priority,
    warnings: task.warnings,
  }
}
