import { Link, NavLink } from 'react-router-dom'
import { User, Zap } from 'lucide-react'
import { Container, ThemeToggle } from '@/components/common'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', to: '/' },
  { id: 'history', label: 'History', to: '/history' },
] as const

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-container-low">
      <Container className="flex h-[4.375rem] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span
              className="flex size-9 items-center justify-center rounded-[var(--radius-button)] bg-button-primary text-button-primary-foreground shadow-sm"
              aria-hidden="true"
            >
              <Zap className="size-4" strokeWidth={2.25} />
            </span>
            <span className="text-base font-bold tracking-tight text-foreground">
              NOVA AI
            </span>
          </Link>

          <nav
            className="hidden items-stretch gap-1 md:flex"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted hover:text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span
                        className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <button
            type="button"
            aria-label="User account"
            className={cn(
              'flex size-9 items-center justify-center rounded-[var(--radius-button)] border border-border',
              'bg-surface-container text-muted',
              'transition-colors hover:bg-hover hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            <User className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </Container>
    </header>
  )
}
