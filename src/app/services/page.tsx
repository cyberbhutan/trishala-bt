import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react'
import type { ServiceListing, ServiceCategory } from '@/lib/types'

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const supabase = await createServerSupabase()

  const categorySlug = params.category
  const city = params.city
  const query = params.q

  // ── Build service query ──
  let dbQuery = supabase
    .from('services')
    .select(`
      *,
      categories:service_categories(*)
    `, { count: 'exact' })
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(24)

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('service_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (cat) {
      dbQuery = dbQuery.eq('category_id', cat.id)
    }
  }

  if (city) dbQuery = dbQuery.eq('city', city)
  if (query) {
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,short_description.ilike.%${query}%`
    )
  }

  const { data: services, count } = await dbQuery

  // ── Fetch categories ──
  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .order('name')

  // ── Format helpers ──
  function formatPrice(service: ServiceListing) {
    if (service.price_type === 'free') return 'Free'
    if (service.price_type === 'quote') return 'Quote Required'
    if (service.price_type === 'hourly' && service.price) {
      return `Nu. ${service.price}/hr`
    }
    if (service.price && service.price_type === 'fixed') {
      return `Nu. ${service.price.toLocaleString()}`
    }
    return 'Contact for price'
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Services Marketplace
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Find and book trusted service providers across Bhutan
          </p>
        </div>

        {/* ── Search ── */}
        <div className="mb-8">
          <form action="/services" method="GET" className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              name="q"
              defaultValue={query || ''}
              placeholder="Search services (e.g., plumber, tutor, photographer)..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/30 backdrop-blur-sm focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
            />
          </form>
        </div>

        {/* ── Category Filters ── */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/services"
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              !categorySlug
                ? 'bg-[#FF8A00] text-white'
                : 'border border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            All Services
          </Link>
          {categories?.map((cat: ServiceCategory) => (
            <Link
              key={cat.id}
              href={`/services?category=${cat.slug}`}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                categorySlug === cat.slug
                  ? 'bg-[#FF8A00] text-white'
                  : 'border border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </Link>
          ))}
        </div>

        {/* ── Results ── */}
        {(!services || services.length === 0) ? (
          <div className="py-20 text-center">
            <p className="text-white/40">
              No services found. Try a different search or category.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-white/40">
              {count} service{count !== 1 ? 's' : ''} found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service: any) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all hover:border-[#FF8A00]/20 hover:bg-white/[0.06]"
                >
                  {/* Cover */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#003B82]/20 to-[#0F172A]">
                    {service.cover_image ? (
                      <img
                        src={service.cover_image}
                        alt={service.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl font-bold text-white/10">
                          {service.title.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      {service.is_featured && (
                        <span className="rounded-full bg-[#FF8A00]/20 px-2.5 py-0.5 text-[10px] font-medium text-[#FF8A00] backdrop-blur-sm">
                          Featured
                        </span>
                      )}
                      {service.categories && (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-sm">
                          {service.categories.name}
                        </span>
                      )}
                    </div>

                    {/* Price tag */}
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {formatPrice(service)}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-[#FF8A00]">
                      {service.title}
                    </h3>

                    {service.short_description && (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/50">
                        {service.short_description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
                      {service.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {service.city}
                        </span>
                      )}
                      {service.avg_rating > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[#FF8A00] text-[#FF8A00]" />
                          {service.avg_rating.toFixed(1)}
                          <span className="text-white/30">
                            ({service.review_count})
                          </span>
                        </span>
                      )}
                      {service.booking_count > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.booking_count} booked
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#FF8A00] opacity-0 transition-opacity group-hover:opacity-100">
                      View Details <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
