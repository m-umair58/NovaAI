import { Skeleton } from '@/components/common'
import { Pencil } from 'lucide-react'
import { DueDateDisplay } from './DueDateDisplay'
import { TaskCard } from './TaskCard'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskWarnings } from './TaskWarnings'
import { cn } from '@/lib/utils'
import { getOwnerInitial, hasWarnings, isUnassignedOwner } from '@/utils/task'
import type { ExtractedTask } from '@/types/task'

interface TaskTableProps {
  tasks: ExtractedTask[]
  loading: boolean
  editable?: boolean
  onEditTask?: (task: ExtractedTask) => void
  onResolveConflicts?: (taskId: string) => void
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <tr className={cn(index % 2 === 0 ? 'bg-card' : 'bg-hover/30')}>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-full max-w-xs" />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-5 w-28 rounded-full" />
      </td>
      <td className="px-4 py-4">
        <Skeleton className="h-12 w-full max-w-[12rem]" />
      </td>
    </tr>
  )
}

function OwnerCell({ owner }: { owner: string }) {
  const unassigned = isUnassignedOwner(owner)

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-background',
          unassigned
            ? 'bg-hover text-muted'
            : 'bg-primary/15 text-primary',
        )}
        aria-hidden="true"
      >
        {getOwnerInitial(owner)}
      </span>
      <span className="text-sm font-medium text-foreground">{owner}</span>
    </div>
  )
}

function DesktopTable({
  tasks,
  loading,
  editable = false,
  onEditTask,
  onResolveConflicts,
}: TaskTableProps) {
  return (
    <div className="hidden h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)] md:flex">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full min-w-[960px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Task
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Owner
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Due Date
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Priority
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Status
              </th>
              <th className="min-w-[14rem] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Conflicts
              </th>
              {editable && (
                <th className="w-24 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={`skeleton-${index}`} index={index} />
                ))
              : tasks.map((task, index) => {
                  const needsReview = hasWarnings(task)

                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        'border-b border-border last:border-b-0',
                        index % 2 === 0 ? 'bg-card' : 'bg-hover/20',
                        needsReview && 'bg-warning/[0.03]',
                        'hover:bg-hover/60',
                      )}
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm leading-relaxed text-foreground">
                          {task.task}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <OwnerCell owner={task.owner} />
                      </td>
                      <td className="px-4 py-4">
                        <DueDateDisplay task={task} />
                      </td>
                      <td className="px-4 py-4">
                        <TaskPriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-4">
                        <TaskStatusBadge task={task} />
                      </td>
                      <td className="px-5 py-5 align-top">
                        <TaskWarnings
                          warnings={task.warnings}
                          onResolve={
                            editable && onResolveConflicts
                              ? () => onResolveConflicts(task.id)
                              : undefined
                          }
                        />
                      </td>
                      {editable && onEditTask && (
                        <td className="px-4 py-4 align-top">
                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-badge)] border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-hover"
                            aria-label={`Edit task: ${task.task}`}
                          >
                            <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MobileCards({
  tasks,
  loading,
  editable = false,
  onEditTask,
  onResolveConflicts,
}: TaskTableProps) {
  if (loading) {
    return (
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`mobile-skeleton-${index}`}
            className="space-y-3 rounded-[var(--radius-card)] border border-border bg-card p-4"
          >
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3 md:hidden">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          editable={editable}
          onEdit={onEditTask}
          onResolveConflicts={onResolveConflicts}
        />
      ))}
    </div>
  )
}

export function TaskTable({
  tasks,
  loading,
  editable = false,
  onEditTask,
  onResolveConflicts,
}: TaskTableProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DesktopTable
        tasks={tasks}
        loading={loading}
        editable={editable}
        onEditTask={onEditTask}
        onResolveConflicts={onResolveConflicts}
      />
      <MobileCards
        tasks={tasks}
        loading={loading}
        editable={editable}
        onEditTask={onEditTask}
        onResolveConflicts={onResolveConflicts}
      />
    </div>
  )
}
