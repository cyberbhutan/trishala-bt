'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  Star,
  BadgeCheck,
  Sparkles,
  AlertTriangle,
  Store,
  Clock,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './Badge'
import SaveButton from './SaveButton'
import type {
  Business,
  Classified,
  ServiceListing,
  Job,
} from '@/lib/types'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

type ListingVariant = 'business' | 'classified' | 'service' | 'job'

type ListingItem = Business | Classified | ServiceListing | Job

interface ListingCardProps {
  variant: ListingVariant
  item: ListingItem
  href?: string
  className?: string
}

/* ═══════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════ */

const variantStyles: Record<
  ListingVariant,
  { accent: string; accentBg: string; accentBorder: string }
> = {
  business: {
    accent: 'text-accent-500',
    accentBg: 'bg-accent-500/10',
    accentBorder: 'hover:border-accent-500/20',
  },
  classified: {
    accent: 'text-blue-400',
    accentBg: 'bg-blue-400/10',
    accentBorder: 'hover:border-blue-400/20',
  },
  service: {
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-400/10',
    accentBorder: 'hover:border-emerald-400/20',
  },
  job: {
    accent: 'text-purple-400',
    accentBg: 'bg-purple-400/10',
    accentBorder: 'hover:border-purple-400/20',
  },
}

function formatPrice(
  item: ListingItem,
  variant: ListingVariant
): string {
  if (variant === 'classified') {
    const c = item as Classified
    if (c.price_type === 'free') return 'Free'
    if (c.price !== null && c.price !== undefined)
      return `Nu. ${Number(c.price).toLocaleString()}`
    return 'Negotiable'
  }
  if (variant === 'service') {
    const s = item as ServiceListing
    if (s.price_type === 'free') return 'Free'
    if (s.price_type === 'quote') return 'Request Quote'
    if (s.price !== null && s.price !== undefined)
      return `Nu. ${Number(s.price)}${s.price_type === 'hourly' ? '/hr' : ''}`
    return 'Contact'
  }
  if (variant === 'job') {
    const j = item as Job
    if (j.salary_min !== null && j.salary_min !== undefined) {
      const min = Number(j.salary_min).toLocaleString()
      const max =
        j.salary_max ? ` - ${Number(j.salary_max).toLocaleString()}` : ''
      return `Nu. ${min}${max}`
    }
    return ''
  }
  return ''
}

function getCoverImage(item: ListingItem, variant: ListingVariant): string | null {
  if (variant === 'business') return (item as Business).cover_image
  if (variant === 'classified') {
    const images = (item as Classified).images
    return images?.[0] ?? null
  }
  if (variant === 'service') return (item as ServiceListing).cover_image
  return null
}

function getTitle(item: ListingItem, variant: ListingVariant): string {
  if (variant === 'business') return (item as Business).name
  return (item as any).title ?? ''
}

function getLocation(item: ListingItem, variant: ListingVariant): string | null {
  if (variant === 'business') return (item as Business).city
  if (variant === 'classified') return (item as Classified).city ?? (item as Classified).location
  if (variant === 'service') return (item as ServiceListing).city ?? (item as ServiceListing).location
  if (variant === 'job') return (item as Job).city ?? (item as Job).location
  return null
}

function getHref(item: ListingItem, variant: ListingVariant): string {
  if (variant === 'business') return `/business/${(item as Business).slug}`
  if (variant === 'classified') return `/classifieds/${item.id}`
  if (variant === 'service') return `/services/${item.id}`
  if (variant === 'job') return `/jobs/${item.id}`
  return '/'
}

function getRating(
  item: ListingItem,
  variant: ListingVariant
): { avg: number; count: number } | null {
  if (variant === 'business') {
    const b = item as Business
    return b.review_count > 0
      ? { avg: Number(b.avg_rating), count: b.review_count }
      : null
  }
  if (variant === 'service') {
    const s = item as ServiceListing
    return s.review_count > 0
      ? { avg: Number(s.avg_rating), count: s.review_count }
      : null
  }
  return null
}

function getEmploymentMeta(job: Job) {
  const parts: string[] = []
  if (job.employment_type) parts.push(job.employment_type.replace('-', ' '))
  if (job.work_type) parts.push(job.work_type.replace('-', ' '))
  return parts
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function ListingCard({
  variant,
  item,
  href,
  className,
}: ListingCardProps) {
  const styles = variantStyles[variant]
  const coverImage = getCoverImage(item, variant)
  const title = getTitle(item, variant)
  const location = getLocation(item, variant)
  const price = formatPrice(item, variant)
  const rating = getRating(item, variant)
  const linkHref = href ?? getHref(item, variant)

  // Variant-specific props
  const isBusiness = variant === 'business'
  const isClassified = variant === 'classified'
  const isService = variant === 'service'
  const isJob = variant === 'job'

  const bizItem = isBusiness ? (item as Business) : null
  const classifiedItem = isClassified ? (item as Classified) : null
  const serviceItem = isService ? (item as ServiceListing) : null
  const jobItem = isJob ? (item as Job) : null

  /* ── Content ── */
  const content = (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5',
        styles.accentBorder,
        className
      )}
    >
      {/* ═══════ Cover Image ═══════ */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#003B82]/20 to-[#0F172A]">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {variant === 'business' && (
              <Store className="h-10 w-10 text-white/10" />
            )}
            {variant === 'classified' && (
              <Store className="h-10 w-10 text-white/10" />
            )}
            {variant === 'service' && (
              <Store className="h-10 w-10 text-white/10" />
            )}
            {variant === 'job' && (
              <Briefcase className="h-10 w-10 text-white/10" />
            )}
          </div>
        )}

        {/* ── Heart/Save Button ── */}
        <div className="absolute right-3 top-3 z-10">
          <SaveButton
            itemType={variant}
            itemId={item.id as number}
            initialSaved={false}
          />
        </div>

        {/* ── Badges ── */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {/* Business: Verified / Featured */}
          {isBusiness && bizItem?.is_verified && (
            <Badge
              variant="success"
              size="sm"
              icon={<BadgeCheck className="h-3 w-3" />}
            >
              Verified
            </Badge>
          )}
          {isBusiness && bizItem?.is_featured && (
            <Badge
              variant="premium"
              size="sm"
              icon={<Sparkles className="h-3 w-3" />}
            >
              Featured
            </Badge>
          )}

          {/* Service: Featured */}
          {isService && serviceItem?.is_featured && (
            <Badge
              variant="premium"
              size="sm"
              icon={<Sparkles className="h-3 w-3" />}
            >
              Featured
            </Badge>
          )}

          {/* Job: Featured / Urgent */}
          {isJob && jobItem?.is_featured && (
            <Badge
              variant="premium"
              size="sm"
              icon={<Sparkles className="h-3 w-3" />}
            >
              Featured
            </Badge>
          )}
          {isJob && jobItem?.is_urgent && (
            <Badge
              variant="danger"
              size="sm"
              icon={<AlertTriangle className="h-3 w-3" />}
            >
              Urgent
            </Badge>
          )}

          {/* Classified: condition */}
          {isClassified && classifiedItem?.condition && (
            <Badge variant="default" size="sm">
              {classifiedItem.condition.replace('-', ' ')}
            </Badge>
          )}
        </div>

        {/* ── Rating pill (bottom-right) ── */}
        {rating && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {rating.avg.toFixed(1)}
            <span className="text-white/60">({rating.count})</span>
          </div>
        )}

        {/* ── Classified: price overlay ── */}
        {isClassified && price && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-bold text-accent-500 backdrop-blur-sm">
            {price}
          </div>
        )}
      </div>

      {/* ═══════ Body ═══════ */}
      <div className="flex flex-1 flex-col p-4 min-w-0">
        {/* Title */}
        <h3
          className={cn(
            'text-sm font-semibold leading-snug text-white transition-colors truncate',
            'group-hover:text-accent-500'
          )}
        >
          {title}
        </h3>

        {/* Company (Jobs) */}
        {isJob && jobItem?.company_name && (
          <p className="mt-0.5 text-xs text-white/50">{jobItem.company_name}</p>
        )}

        {/* Short description (Business / Service) */}
        {isBusiness && (item as Business).short_description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/50">
            {(item as Business).short_description}
          </p>
        )}
        {isService && (item as ServiceListing).short_description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/50">
            {(item as ServiceListing).short_description}
          </p>
        )}

        {/* Job meta: employment type, work type */}
        {isJob && jobItem && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {getEmploymentMeta(jobItem).map((meta) => (
              <span
                key={meta}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium capitalize text-white/40"
              >
                {meta}
              </span>
            ))}
          </div>
        )}

        {/* Price (Service / Job) */}
        {isService && price && (
          <p className="mt-2 text-sm font-bold text-accent-500">{price}</p>
        )}
        {isJob && price && (
          <p className="mt-2 text-sm font-semibold text-white/70">{price}</p>
        )}

        {/* Footer row */}
        <div className="mt-auto flex items-center justify-between pt-3">
          {/* Location */}
          {location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </span>
          )}

          {/* Rating (icon-only for small cards) */}
          {rating && !isBusiness && !isService && (
            <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating.avg.toFixed(1)}
            </span>
          )}

          {/* Business: review count text */}
          {isBusiness && bizItem?.review_count !== undefined && bizItem.review_count > 0 && (
            <span className="text-[11px] text-white/30">
              {bizItem.review_count} review{bizItem.review_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Link href={linkHref} className="block">
      {content}
    </Link>
  )
}
