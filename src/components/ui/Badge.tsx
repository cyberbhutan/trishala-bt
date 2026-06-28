'use client'

import { type HTMLAttributes, type ReactNode, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Badge Variants
   ═══════════════════════════════════════════════════════════════════ */

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5 font-medium rounded-full',
    'transition-colors duration-200 select-none',
    'whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-brand-700/10 text-brand-700',
        accent: 'bg-accent-500/10 text-accent-700',
        success: 'bg-emerald-50 text-emerald-700',
        warning: 'bg-amber-50 text-amber-700',
        danger: 'bg-red-50 text-red-700',
        premium: [
          'bg-gradient-brand text-white',
          'shadow-sm',
        ],
        outline: 'border border-gray-200 bg-transparent text-gray-600',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[10px] leading-tight',
        sm: 'px-2.5 py-0.5 text-[11px]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
      dot: {
        true: 'before:h-1.5 before:w-1.5 before:rounded-full before:bg-current',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

/* ── Status shorthand presets ── */

const STATUS_MAP: Record<string, { variant: BadgeProps['variant']; label: string }> = {
  // Business statuses
  pending:    { variant: 'warning', label: 'Pending' },
  approved:   { variant: 'success', label: 'Approved' },
  rejected:   { variant: 'danger',  label: 'Rejected' },
  suspended:  { variant: 'danger',  label: 'Suspended' },
  // Subscription statuses
  active:     { variant: 'success', label: 'Active' },
  expired:    { variant: 'danger',  label: 'Expired' },
  cancelled:  { variant: 'default', label: 'Cancelled' },
  // Subscription tiers
  free:       { variant: 'default', label: 'Free' },
  featured:   { variant: 'primary', label: 'Featured' },
  spotlight:  { variant: 'premium', label: 'Spotlight' },
}

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: ReactNode
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot }), className)}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'

/* ═══════════════════════════════════════════════════════════════════
   StatusBadge — auto-maps from a status/tier value
   ═══════════════════════════════════════════════════════════════════ */

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string
}

function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const mapped = STATUS_MAP[status.toLowerCase()] ?? { variant: 'default' as const, label: status }
  return (
    <Badge variant={mapped.variant} {...props}>
      {mapped.label}
    </Badge>
  )
}
StatusBadge.displayName = 'StatusBadge'

export { Badge, StatusBadge, badgeVariants }
