import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type SectionProps = HTMLAttributes<HTMLElement>

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section className={cn('w-full py-10 md:py-16', className)} {...props}>
      {children}
    </section>
  )
}