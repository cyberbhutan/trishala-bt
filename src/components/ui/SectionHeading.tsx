import { type ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface SectionAction {
  href: string
  label: string
}

interface SectionHeadingProps {
  title: string
  subtitle?: string
  action?: SectionAction
  icon?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function SectionHeading({
  title,
  subtitle,
  action,
  icon,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-white/60">{subtitle}</p>
            )}
          </div>
        </div>

        {action && (
          <Link
            href={action.href}
            className="group flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent-500 transition-colors hover:text-accent-400"
          >
            <span>{action.label}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
