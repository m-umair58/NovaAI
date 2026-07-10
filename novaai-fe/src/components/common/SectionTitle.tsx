import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type SectionTitleProps = HTMLAttributes<HTMLHeadingElement>

export function SectionTitle({ className, children, ...props }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        'text-headline-md tracking-tight text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  )
}
