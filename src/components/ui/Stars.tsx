'use client'

import { useState, forwardRef, type HTMLAttributes } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface StarsDisplayProps extends HTMLAttributes<HTMLDivElement> {
  rating: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  showCount?: boolean
  count?: number
}

interface StarsInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number
  onChange?: (rating: number) => void
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

/* ═══════════════════════════════════════════════════════════════════
   Size map
   ═══════════════════════════════════════════════════════════════════ */

const starSizes = {
  sm: { star: 'h-3.5 w-3.5', text: 'text-xs', gap: 'gap-0.5' },
  md: { star: 'h-5 w-5',     text: 'text-sm', gap: 'gap-0.5' },
  lg: { star: 'h-6 w-6',     text: 'text-base', gap: 'gap-1' },
} as const

/* ═══════════════════════════════════════════════════════════════════
   StarsDisplay — read-only
   ═══════════════════════════════════════════════════════════════════ */

const StarsDisplay = forwardRef<HTMLDivElement, StarsDisplayProps>(
  (
    {
      rating,
      maxStars = 5,
      size = 'md',
      showValue = false,
      showCount = false,
      count,
      className,
      ...props
    },
    ref
  ) => {
    const safeRating = Math.max(0, Math.min(rating, maxStars))
    const { star, text, gap } = starSizes[size]

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-1', className)}
        aria-label={`${safeRating.toFixed(1)} out of ${maxStars} stars`}
        {...props}
      >
        <div className={cn('inline-flex', gap)}>
          {Array.from({ length: maxStars }, (_, i) => {
            const filled = i < Math.floor(safeRating)
            const half = !filled && i < safeRating
            return (
              <Star
                key={i}
                className={cn(
                  star,
                  'transition-colors',
                  filled
                    ? 'fill-yellow-400 text-yellow-400'
                    : half
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                )}
                aria-hidden="true"
              />
            )
          })}
        </div>

        {showValue && (
          <span className={cn('ml-1 font-semibold text-navy', text)}>
            {safeRating.toFixed(1)}
          </span>
        )}

        {showCount && count !== undefined && (
          <span className={cn('text-gray-400', text)}>
            ({count})
          </span>
        )}
      </div>
    )
  }
)
StarsDisplay.displayName = 'StarsDisplay'

/* ═══════════════════════════════════════════════════════════════════
   StarsInput — interactive
   ═══════════════════════════════════════════════════════════════════ */

const StarsInput = forwardRef<HTMLDivElement, StarsInputProps>(
  (
    {
      value,
      onChange,
      maxStars = 5,
      size = 'md',
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const [hovered, setHovered] = useState(0)
    const { star, gap } = starSizes[size]

    const displayValue = hovered || value

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center',
          gap,
          disabled && 'pointer-events-none opacity-60',
          className
        )}
        role="radiogroup"
        aria-label="Rating"
        {...props}
      >
        {Array.from({ length: maxStars }, (_, i) => {
          const starValue = i + 1
          const filled = starValue <= displayValue

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => !disabled && setHovered(starValue)}
              onMouseLeave={() => !disabled && setHovered(0)}
              className={cn(
                'rounded-sm p-0.5 transition-all duration-150',
                !disabled && 'hover:scale-110 active:scale-95',
                'focus-visible:outline-2 focus-visible:outline-accent-500'
              )}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              aria-checked={value === starValue}
              role="radio"
            >
              <Star
                className={cn(
                  star,
                  'transition-colors duration-150',
                  filled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200 hover:fill-yellow-400/40'
                )}
              />
            </button>
          )
        })}
      </div>
    )
  }
)
StarsInput.displayName = 'StarsInput'

export { StarsDisplay, StarsInput }
