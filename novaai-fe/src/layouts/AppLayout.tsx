import type { ReactNode } from 'react'
import { Container } from '@/components/common'
import { AppFooter, AppHeader } from '@/components/layout'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="app-background" aria-hidden="true" />

      <AppHeader />
      <main className="flex w-full flex-1 flex-col pt-6 pb-8 md:pt-8 md:pb-10">
        <Container className="flex min-h-0 flex-1 flex-col">{children}</Container>
      </main>
      <AppFooter />
    </div>
  )
}
