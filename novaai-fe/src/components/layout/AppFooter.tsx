import { Container } from '@/components/common'

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
      </Container>
    </footer>
  )
}
