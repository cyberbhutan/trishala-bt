import { type LucideIcon } from 'lucide-react'
import { Store } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface CategoryCardProps {
  name: string
  slug: string
  count?: number
  icon?: LucideIcon
  className?: string
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function CategoryCard({
  name,
  slug,
  count,
  icon: Icon,
  className,
}: CategoryCardProps) {
  const IconComponent = Icon ?? Store

  return (
    <Link
      href={`/browse?category=${slug}`}
      className={cn(
        'group flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-6 text-center',
        'transition-all duration-300',
        'hover:border-accent-500/20 hover:bg-accent-500/5 hover:-translate-y-1',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl',
          'bg-accent-500/10 text-accent-500',
          'transition-all duration-300',
          'group-hover:bg-accent-500/20 group-hover:scale-110'
        )}
      >
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Name */}
      <span className="text-sm font-medium text-white/80 transition-colors group-hover:text-white">
        {name}
      </span>

      {/* Count badge */}
      {count !== undefined && count > 0 && (
        <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/40 transition-colors group-hover:text-white/60">
          {count} listing{count !== 1 ? 's' : ''}
        </span>
      )}
    </Link>
  )
}
