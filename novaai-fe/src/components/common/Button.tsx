import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-button-primary text-button-primary-foreground shadow-[var(--shadow-button-primary)]',
    'hover:brightness-110',
    'active:scale-[0.98] active:shadow-none',
    'focus-visible:ring-ring',
  ),
  secondary: cn(
    'border border-border bg-surface text-foreground',
    'hover:bg-hover',
    'active:scale-[0.98]',
    'focus-visible:ring-ring',
  ),
  ghost: cn(
    'text-foreground hover:bg-hover',
    'active:scale-[0.98]',
    'focus-visible:ring-ring',
  ),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-[var(--radius-button)] font-medium',
          'transition-[background-color,box-shadow,transform] duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
