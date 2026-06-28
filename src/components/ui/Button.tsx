'use client'

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Button Variants
   ═══════════════════════════════════════════════════════════════════ */

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium',
    'transition-all duration-200 ease-out select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.97]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-700 text-white',
          'hover:bg-brand-800',
          'shadow-sm hover:shadow-md',
          'active:bg-brand-900',
        ],
        secondary: [
          'bg-accent-500 text-white',
          'hover:bg-accent-600',
          'shadow-sm hover:shadow-md',
          'active:bg-accent-700',
        ],
        outline: [
          'border-2 border-brand-700 text-brand-700 bg-transparent',
          'hover:bg-brand-700 hover:text-white',
          'active:bg-brand-800 active:border-brand-800',
        ],
        ghost: [
          'text-navy bg-transparent',
          'hover:bg-navy/5',
          'active:bg-navy/10',
        ],
        premium: [
          'bg-gradient-brand text-white',
          'hover:brightness-110',
          'shadow-md hover:shadow-lg',
          'active:brightness-95',
          'before:absolute before:inset-0 before:rounded-xl before:opacity-0',
          'before:bg-gradient-accent before:transition-opacity before:duration-200',
          'hover:before:opacity-100',
          'overflow-hidden',
        ],
        danger: [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'shadow-sm',
          'active:bg-red-800',
        ],
      },
      size: {
        xs: 'h-8 px-3 text-xs rounded-lg',
        sm: 'h-9 px-4 text-sm rounded-lg',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-7 text-base',
        xl: 'h-14 px-9 text-lg',
        icon: 'h-10 w-10 rounded-xl p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, fullWidth }),
          loading && 'cursor-wait',
          variant === 'premium' && 'relative',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-inherit">
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
        )}

        {/* Content — hidden when loading */}
        <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
          {icon && iconPosition === 'left' && (
            <span className="shrink-0">{icon}</span>
          )}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className="shrink-0">{icon}</span>
          )}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
