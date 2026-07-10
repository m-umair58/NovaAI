import { Container } from '@/components/common'
import { cn } from '@/lib/utils'

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Help Center', href: '#' },
  { label: 'API Status', href: '#' },
] as const

const BRAND_NAME = 'NOVA AI'

export function AppFooter() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-surface-container-low">
      <Container className="flex h-[4.375rem] items-center justify-between gap-4 sm:gap-8">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-secondary">{BRAND_NAME}</p>
          <p className="truncate text-sm text-muted">
            © 2026 {BRAND_NAME}. Precision in every word.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 sm:gap-x-8">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={cn(
                    'text-sm text-muted transition-colors hover:text-foreground',
                  )}
                  onClick={(event) => event.preventDefault()}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  )
}
