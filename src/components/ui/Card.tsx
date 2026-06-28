'use client'

import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  type ComponentPropsWithoutRef,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  Star,
  Phone,
  BadgeCheck,
  Sparkles,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './Badge'
import type { Business } from '@/lib/types'

/* ═══════════════════════════════════════════════════════════════════
   Card Wrapper
   ═══════════════════════════════════════════════════════════════════ */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, glass = false, padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-gray-100 bg-white',
          glass && 'glass border-white/20',
          hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
          paddingMap[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

/* ═══════════════════════════════════════════════════════════════════
   Business Card (composed)
   ═══════════════════════════════════════════════════════════════════ */

interface BusinessCardProps extends ComponentPropsWithoutRef<typeof Card> {
  business: Business
  href?: string
  showActions?: boolean
}

function BusinessCard({
  business,
  href,
  className,
  ...props
}: BusinessCardProps) {
  const content = (
    <div className="group flex flex-col gap-0">
      {/* ── Cover / Logo ── */}
      <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden rounded-t-2xl bg-gradient-brand">
        {business.cover_image ? (
          <Image
            src={business.cover_image}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-bold text-white/20">
              {business.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {business.is_verified && (
            <Badge variant="success" size="sm" icon={<BadgeCheck className="h-3 w-3" />}>
              Verified
            </Badge>
          )}
          {business.is_featured && (
            <Badge variant="premium" size="sm" icon={<Sparkles className="h-3 w-3" />}>
              Featured
            </Badge>
          )}
          {business.is_sponsored && (
            <Badge variant="accent" size="sm" icon={<Shield className="h-3 w-3" />}>
              Sponsored
            </Badge>
          )}
        </div>

        {/* Rating pill */}
        {business.review_count > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {business.avg_rating.toFixed(1)}
            <span className="text-white/60">({business.review_count})</span>
          </div>
        )}

        {/* Logo */}
        {business.logo_url && (
          <div className="absolute -bottom-6 left-4 h-14 w-14 overflow-hidden rounded-xl border-2 border-white shadow-md">
            <Image
              src={business.logo_url}
              alt={`${business.name} logo`}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className={cn(business.logo_url && 'mt-6')}>
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-navy transition-colors group-hover:text-brand-700">
            {business.name}
          </h3>
          <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-700" />
        </div>

        {business.short_description && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
            {business.short_description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
          {business.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {business.city}
              {business.area && `, ${business.area}`}
            </span>
          )}
          {business.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {business.phone}
            </span>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      {business.categories && business.categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-gray-50 pt-3">
          {business.categories.slice(0, 3).map((cat) => (
            <span
              key={cat.id}
              className="rounded-full bg-brand-700/5 px-2.5 py-0.5 text-[11px] font-medium text-brand-700"
            >
              {cat.name}
            </span>
          ))}
          {business.categories.length > 3 && (
            <span className="text-[11px] text-gray-400">
              +{business.categories.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className={cn('cursor-pointer', className)} {...props}>
          {content}
        </Card>
      </Link>
    )
  }

  return (
    <Card className={className} {...props}>
      {content}
    </Card>
  )
}

BusinessCard.displayName = 'BusinessCard'

/* ═══════════════════════════════════════════════════════════════════
   Stats Card
   ═══════════════════════════════════════════════════════════════════ */

interface StatsCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, label, value, icon, trend, trendValue, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:shadow-md',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-navy">{value}</p>
            {trend && trendValue && (
              <p
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  trend === 'up' && 'text-green-600',
                  trend === 'down' && 'text-red-500',
                  trend === 'neutral' && 'text-gray-400'
                )}
              >
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'neutral' && '→'}
                {trendValue}
              </p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700/10 text-brand-700">
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)
StatsCard.displayName = 'StatsCard'

export { Card, BusinessCard, StatsCard }
