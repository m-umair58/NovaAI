import { Skeleton } from '@/components/common'

export function HistoryLoadingState() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`history-skeleton-${index}`}
          className="rounded-[var(--radius-card)] border border-border/80 bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}
