import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Filter, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  OwnerFilter,
  PriorityFilter,
  SortOption,
  WarningFilter,
} from '@/utils/task'
import type { TaskPriority } from '@/types/task'

interface TaskToolbarProps {
  search: string
  ownerFilter: OwnerFilter
  warningFilter: WarningFilter
  priorityFilter: PriorityFilter
  sort: SortOption
  owners: string[]
  onSearchChange: (value: string) => void
  onOwnerFilterChange: (value: OwnerFilter) => void
  onWarningFilterChange: (value: WarningFilter) => void
  onPriorityFilterChange: (value: PriorityFilter) => void
  onSortChange: (value: SortOption) => void
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Latest' },
  { value: 'owner', label: 'Owner A-Z' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'task_name', label: 'Task Name' },
  { value: 'priority', label: 'Priority' },
]

const SORT_LABELS: Record<SortOption, string> = Object.fromEntries(
  SORT_OPTIONS.map((option) => [option.value, option.label]),
) as Record<SortOption, string>

const WARNING_FILTER_OPTIONS: { value: WarningFilter; label: string }[] = [
  { value: 'all', label: 'All Tasks' },
  { value: 'with_warnings', label: 'Needs Review' },
  { value: 'no_warnings', label: 'No Conflicts' },
]

const PRIORITY_FILTER_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
  { value: 'Not specified', label: 'Not Specified' },
]

const pillControlClass = cn(
  'h-11 border border-outline-variant/70 bg-surface-container-low text-sm font-medium text-foreground shadow-sm',
  'hover:bg-hover focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20',
)

const dropdownListClass =
  'absolute right-0 top-full z-20 mt-2 min-w-[10rem] overflow-hidden rounded-[var(--radius-card)] border border-border bg-dropdown py-1 shadow-[var(--shadow-card-hover)]'

const dropdownOptionClass =
  'w-full px-3 py-2 text-left text-sm hover:bg-hover'

export function TaskToolbar({
  search,
  ownerFilter,
  warningFilter,
  priorityFilter,
  sort,
  owners,
  onSearchChange,
  onOwnerFilterChange,
  onWarningFilterChange,
  onPriorityFilterChange,
  onSortChange,
}: TaskToolbarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortRef.current &&
        !sortRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false)
      }
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filterLabel =
    ownerFilter === 'all'
      ? 'All Owners'
      : ownerFilter === 'unassigned'
        ? 'Unassigned'
        : ownerFilter

  const activeFilterCount =
    (ownerFilter !== 'all' ? 1 : 0) +
    (warningFilter !== 'all' ? 1 : 0) +
    (priorityFilter !== 'all' ? 1 : 0)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks by name"
            className={cn(
              pillControlClass,
              'w-full rounded-[var(--radius-input)] pl-10 pr-4',
            )}
          />
        </div>

        <div ref={sortRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Sort tasks"
            aria-expanded={isSortOpen}
            aria-haspopup="listbox"
            onClick={() => {
              setIsSortOpen((open) => !open)
              setIsFilterOpen(false)
            }}
            className={cn(
              pillControlClass,
              'flex min-w-[9.5rem] items-center justify-center gap-1.5 rounded-[var(--radius-input)] px-4',
              isSortOpen && 'border-primary bg-hover',
            )}
          >
            <span className="text-sm font-semibold text-foreground">
              Sort: {SORT_LABELS[sort]}
            </span>
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted transition-transform',
                isSortOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>

          {isSortOpen && (
            <ul role="listbox" aria-label="Sort tasks" className={dropdownListClass}>
              {SORT_OPTIONS.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={sort === option.value}
                >
                  <button
                    type="button"
                    className={cn(
                      dropdownOptionClass,
                      sort === option.value
                        ? 'font-semibold text-primary'
                        : 'text-foreground',
                    )}
                    onClick={() => {
                      onSortChange(option.value)
                      setIsSortOpen(false)
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div ref={filterRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="Filter tasks"
            aria-expanded={isFilterOpen}
            aria-haspopup="listbox"
            onClick={() => {
              setIsFilterOpen((open) => !open)
              setIsSortOpen(false)
            }}
            className={cn(
              pillControlClass,
              'relative flex h-11 w-11 items-center justify-center rounded-[var(--radius-input)]',
              isFilterOpen && 'border-primary bg-hover',
              activeFilterCount > 0 && 'border-warning/50',
            )}
          >
            <Filter className="size-4 text-muted" strokeWidth={1.75} />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-warning text-[0.625rem] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {isFilterOpen && (
            <div
              className={cn(
                dropdownListClass,
                'right-0 min-w-[14rem] p-2',
              )}
            >
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Owner
              </p>
              <ul role="listbox" aria-label="Filter by owner" className="mb-2">
                {[
                  { value: 'all' as const, label: 'All Owners' },
                  ...owners.map((owner) => ({ value: owner, label: owner })),
                  { value: 'unassigned' as const, label: 'Unassigned' },
                ].map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={ownerFilter === option.value}
                  >
                    <button
                      type="button"
                      className={cn(
                        dropdownOptionClass,
                        ownerFilter === option.value
                          ? 'font-semibold text-primary'
                          : 'text-foreground',
                      )}
                      onClick={() => onOwnerFilterChange(option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Conflicts
              </p>
              <ul role="listbox" aria-label="Filter by conflicts" className="mb-2">
                {WARNING_FILTER_OPTIONS.map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={warningFilter === option.value}
                  >
                    <button
                      type="button"
                      className={cn(
                        dropdownOptionClass,
                        warningFilter === option.value
                          ? 'font-semibold text-primary'
                          : 'text-foreground',
                      )}
                      onClick={() => onWarningFilterChange(option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Priority
              </p>
              <ul role="listbox" aria-label="Filter by priority">
                {PRIORITY_FILTER_OPTIONS.map((option) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={priorityFilter === option.value}
                  >
                    <button
                      type="button"
                      className={cn(
                        dropdownOptionClass,
                        priorityFilter === option.value
                          ? 'font-semibold text-primary'
                          : 'text-foreground',
                      )}
                      onClick={() =>
                        onPriorityFilterChange(option.value as TaskPriority | 'all')
                      }
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <span className="sr-only">Active owner filter: {filterLabel}</span>
    </div>
  )
}
