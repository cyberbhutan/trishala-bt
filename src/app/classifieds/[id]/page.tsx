import { createServerSupabase } from '@/lib/supabase/server'
import { incrementClassifiedView } from '@/lib/actions/classifieds'
import { formatDate, getWhatsAppLink } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  MapPin,
  Tag,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react'
import type { Classified } from '@/lib/types'

/* ═══════════════════════════════════════════════════════════════════
   Image Gallery (client-only interactivity handled via basic HTML)
   ═══════════════════════════════════════════════════════════════════ */

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-gradient-to-br from-[#003B82]/20 to-[#0F172A]">
        <Package className="h-12 w-12 text-white/20" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        <img
          src={images[0]}
          alt={title}
          className="aspect-[16/10] w-full object-cover"
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <div
              key={i}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                i === 0
                  ? 'border-[#FF8A00]/50 ring-1 ring-[#FF8A00]/30'
                  : 'border-white/5 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={src}
                alt={`${title} — ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Condition Badge Helper
   ═══════════════════════════════════════════════════════════════════ */

const conditionColors: Record<string, string> = {
  new: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  'like-new': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  good: 'bg-[#FF8A00]/10 text-[#FF8A00] border-[#FF8A00]/20',
  fair: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  used: 'bg-white/5 text-white/50 border-white/10',
}

/* ═══════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════ */

export default async function ClassifiedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const classifiedId = parseInt(id, 10)

  if (isNaN(classifiedId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <p className="text-lg text-white/40">Invalid classified ID</p>
          <Link
            href="/classifieds"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#FF8A00] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to classifieds
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createServerSupabase()

  const { data: raw } = await supabase
    .from('classifieds')
    .select('*, categories:classified_categories(*)')
    .eq('id', classifiedId)
    .single()

  const item = raw as unknown as Classified | null

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <Package className="h-6 w-6 text-white/30" />
          </div>
          <p className="text-lg text-white/40">Classified not found</p>
          <Link
            href="/classifieds"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#FF8A00] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to classifieds
          </Link>
        </div>
      </div>
    )
  }

  // ── Fetch seller profile if has user_id ──
  let sellerProfile: { full_name: string | null; avatar_url: string | null; phone: string | null } | null = null
  if (item.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, phone')
      .eq('id', item.user_id)
      .single()
    sellerProfile = profile
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Back link ── */}
        <Link
          href="/classifieds"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to classifieds
        </Link>

        {/* ── View counter (server action form) ── */}
        <form action={incrementClassifiedView.bind(null, classifiedId)}>
          <button type="submit" className="sr-only">
            Record view
          </button>
        </form>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* ── Left: Gallery ── */}
          <div className="lg:col-span-3">
            <ImageGallery images={item.images} title={item.title} />
          </div>

          {/* ── Right: Details ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm">
              {/* Price */}
              <div className="mb-4">
                {item.price != null && item.price_type !== 'free' ? (
                  <div>
                    <span className="text-3xl font-bold text-white">
                      Nu. {item.price.toLocaleString()}
                    </span>
                    {item.price_type === 'negotiable' && (
                      <span className="ml-2 text-sm text-white/40">or best offer</span>
                    )}
                  </div>
                ) : item.price_type === 'free' ? (
                  <span className="text-2xl font-bold text-emerald-400">Free</span>
                ) : item.price_type === 'exchange' ? (
                  <span className="text-2xl font-bold text-[#FF8A00]">For Exchange</span>
                ) : null}
              </div>

              {/* Title */}
              <h1 className="mb-4 text-xl font-bold leading-tight text-white">
                {item.title}
              </h1>

              {/* Condition & Category badges */}
              <div className="mb-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                    conditionColors[item.condition] || conditionColors.used
                  }`}
                >
                  {item.condition}
                </span>
                {item.categories && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#003B82]/30 bg-[#003B82]/10 px-3 py-1 text-xs font-medium text-[#60A5FA]">
                    <Tag className="h-3 w-3" />
                    {item.categories.name}
                  </span>
                )}
              </div>

              {/* Meta info */}
              <div className="mb-6 space-y-2 text-sm text-white/50">
                {item.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-white/30" />
                    <span>
                      {item.city}
                      {item.location ? ` — ${item.location}` : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/30" />
                  <span>Posted {formatDate(item.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-white/30" />
                  <span>{item.views_count} views</span>
                </div>
              </div>

              {/* Contact buttons */}
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Contact Seller
                </p>

                {item.phone && (
                  <a
                    href={`tel:${item.phone}`}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all hover:border-[#FF8A00]/20 hover:bg-white/[0.08]"
                  >
                    <Phone className="h-4 w-4 text-[#FF8A00]" />
                    <span>{item.phone}</span>
                  </a>
                )}

                {item.email && (
                  <a
                    href={`mailto:${item.email}`}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all hover:border-[#FF8A00]/20 hover:bg-white/[0.08]"
                  >
                    <Mail className="h-4 w-4 text-[#FF8A00]" />
                    <span>{item.email}</span>
                  </a>
                )}

                {item.whatsapp && (
                  <a
                    href={getWhatsAppLink(item.whatsapp, `Hi, I'm interested in your classified: ${item.title}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-3 rounded-xl bg-[#25D366]/10 px-4 py-3 text-sm font-medium text-[#25D366] transition-all hover:bg-[#25D366]/20 border border-[#25D366]/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}

                {!item.phone && !item.email && !item.whatsapp && (
                  <p className="text-xs text-white/30">
                    No contact information provided.
                  </p>
                )}
              </div>
            </div>

            {/* ── Seller info card ── */}
            {sellerProfile && (
              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                  Seller
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003B82]/30 text-sm font-semibold text-white">
                    {(sellerProfile.full_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {sellerProfile.full_name || 'Anonymous'}
                    </p>
                    {sellerProfile.phone && (
                      <p className="text-xs text-white/40">{sellerProfile.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Description ── */}
        {item.description && (
          <div className="mt-8">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
              <h2 className="mb-4 text-lg font-semibold text-white">Description</h2>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                {item.description}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
