import { useEffect, useId, useState, type FormEvent } from 'react'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/common'
import { TaskWarnings } from './TaskWarnings'
import { cn } from '@/lib/utils'
import {
  applyTaskEdit,
  hasDueDate,
  isUnassignedOwner,
  NO_DUE_DATE,
  UNASSIGNED_OWNER,
} from '@/utils/task'
import type { ExtractedTask, TaskEditValues, TaskPriority } from '@/types/task'

interface TaskEditDialogProps {
  task: ExtractedTask | null
  suggestedOwners: string[]
  open: boolean
  onClose: () => void
  onSave: (task: ExtractedTask) => void
  onResolveConflicts: (taskId: string) => void
}

const PRIORITY_OPTIONS: TaskPriority[] = [
  'High',
  'Medium',
  'Low',
  'Not specified',
]

const fieldClass = cn(
  'w-full rounded-[var(--radius-input)] border border-outline-variant/70 bg-surface-container-low px-3 py-2.5 text-sm text-foreground shadow-sm',
  'placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20',
)

function toFormValues(task: ExtractedTask): TaskEditValues {
  return {
    task: task.task,
    owner: isUnassignedOwner(task.owner) ? '' : task.owner,
    due_date: hasDueDate(task.due_date) ? task.due_date : '',
    priority: task.priority,
  }
}

export function TaskEditDialog({
  task,
  suggestedOwners,
  open,
  onClose,
  onSave,
  onResolveConflicts,
}: TaskEditDialogProps) {
  const titleId = useId()
  const [values, setValues] = useState<TaskEditValues>({
    task: '',
    owner: '',
    due_date: '',
    priority: 'Not specified',
  })

  useEffect(() => {
    if (task) {
      setValues(toFormValues(task))
    }
  }, [task])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !task) {
    return null
  }

  const hasConflicts = task.warnings.length > 0
  const canSave = values.task.trim().length > 0

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSave) return
    onSave(applyTaskEdit(task, values))
    onClose()
  }

  const handleResolve = () => {
    onResolveConflicts(task.id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close edit dialog"
        className="absolute inset-0 bg-background/70 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card-hover)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-foreground">
              Edit task
            </h2>
            <p className="mt-1 text-sm text-muted">
              Update details, assign an owner, or resolve conflicts before sending
              to your tracker.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-button)] p-2 text-muted hover:bg-hover hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div className="space-y-1.5">
              <label htmlFor="edit-task" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Task
              </label>
              <textarea
                id="edit-task"
                value={values.task}
                onChange={(event) =>
                  setValues((current) => ({ ...current, task: event.target.value }))
                }
                rows={3}
                className={cn(fieldClass, 'resize-y min-h-[5rem]')}
                placeholder="Describe the action item"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-owner" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Owner
              </label>
              <input
                id="edit-owner"
                list="edit-owner-suggestions"
                value={values.owner}
                onChange={(event) =>
                  setValues((current) => ({ ...current, owner: event.target.value }))
                }
                className={fieldClass}
                placeholder={UNASSIGNED_OWNER}
              />
              <datalist id="edit-owner-suggestions">
                {suggestedOwners.map((owner) => (
                  <option key={owner} value={owner} />
                ))}
              </datalist>
              <p className="text-xs text-muted">
                Leave blank to keep the task unassigned, or pick a name from the
                meeting.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-due-date" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Due date
              </label>
              <input
                id="edit-due-date"
                type="date"
                value={values.due_date}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    due_date: event.target.value,
                  }))
                }
                className={fieldClass}
              />
              {!values.due_date && (
                <p className="text-xs text-muted">
                  No due date will be saved as &ldquo;{NO_DUE_DATE}&rdquo;.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-priority" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Priority
              </label>
              <select
                id="edit-priority"
                value={values.priority}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    priority: event.target.value as TaskPriority,
                  }))
                }
                className={fieldClass}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            {hasConflicts && (
              <div className="space-y-3 rounded-[var(--radius-card)] border border-warning/30 bg-warning/5 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Conflicts detected
                    </p>
                    <p className="text-xs leading-relaxed text-muted">
                      Fix the fields above, or mark this task as resolved if you
                      have confirmed the correct values.
                    </p>
                  </div>
                </div>
                <TaskWarnings warnings={task.warnings} />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
            {hasConflicts && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleResolve}
                className="sm:mr-auto"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Resolve conflicts
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
