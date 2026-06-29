import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Search, ChevronLeft, ChevronRight, MapPin, Grid3X3, Map } from 'lucide-react'
import { ListingCard } from '@/components/ui/ListingCard'
import type { Business } from '@/lib/types'

const ListingMap = dynamic(
  () => import('@/components/ui/ListingMap').then((m) => m.ListingMap),
  { ssr: false },
)

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'featured', label: 'Featured' },
] as const

const DEFAULT_SORT = 'newest'
const PER_PAGE = 12

function buildUrl(
  currentParams: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams()

  // Keep existing params that aren't being updated
  for (const [key, value] of Object.entries(currentParams)) {
    if (!(key in updates) && value) {
      params.set(key, value)
    }
  }

  // Apply updates
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === '') {
      params.delete(key)
    } else if (key === 'sort' && value === DEFAULT_SORT) {
      params.delete(key) // don't clutter URL with default
    } else if (key === 'view' && value === 'grid') {
      params.delete(key) // don't clutter URL with default
    } else {
      params.set(key, value)
    }
  }

  const qs = params.toString()
  return qs ? `/browse?${qs}` : '/browse'
}

function Pagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number
  totalPages: number
  params: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  const pages: (number | 'ellipsis')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(params, { page: String(currentPage - 1) })}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-colors hover:border-[#FF8A00]/30 hover:text-[#FF8A00]"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl border border-white/5 text-white/20">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-10 w-10 items-center justify-center text-sm text-white/30"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(params, { page: String(p) })}
            className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl px-3 text-sm font-medium transition-all ${
              p === currentPage
                ? 'bg-[#FF8A00] text-white shadow-lg shadow-[#FF8A00]/20'
                : 'border border-white/10 text-white/60 hover:border-[#FF8A00]/30 hover:text-[#FF8A00]'
            }`}
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(params, { page: String(currentPage + 1) })}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-colors hover:border-[#FF8A00]/30 hover:text-[#FF8A00]"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl border border-white/5 text-white/20">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const supabase = await createServerSupabase()

  const categorySlug = params.category
  const city = params.city
  const query = params.q
  const sort = params.sort || DEFAULT_SORT
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const view = params.view || 'grid'
  const offset = (page - 1) * PER_PAGE

  /* ── Fetch categories ── */
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  /* ── Fetch distinct cities ── */
  const { data: rawCities } = await supabase
    .from('businesses')
    .select('city')
    .eq('status', 'approved')
    .not('city', 'is', null)
    .order('city')

  const uniqueCities = [
    ...new Set(rawCities?.map((r) => r.city).filter(Boolean) as string[]),
  ]

  /* ── Find business IDs matching category filter ── */
  let matchingBizIds: number[] | null = null

  if (categorySlug && categories) {
    const cat = categories.find((c) => c.slug === categorySlug)
    if (cat) {
      const { data: bcRows } = await supabase
        .from('business_categories')
        .select('business_id')
        .eq('category_id', cat.id)

      matchingBizIds = bcRows?.map((r) => r.business_id) ?? []
    } else {
      matchingBizIds = [] // no such category → empty
    }
  }

  /* ── Build main query ── */
  let dbQuery = supabase
    .from('businesses')
    .select('*', { count: 'exact' })
    .eq('status', 'approved')

  if (matchingBizIds !== null) {
    if (matchingBizIds.length > 0) {
      dbQuery = dbQuery.in('id', matchingBizIds)
    } else {
      // Force empty result — no businesses in this category
      dbQuery = dbQuery.in('id', [-1])
    }
  }

  if (city) dbQuery = dbQuery.eq('city', city)
  if (query) dbQuery = dbQuery.ilike('name', `%${query}%`)

  // Apply sorting
  switch (sort) {
    case 'oldest':
      dbQuery = dbQuery.order('created_at', { ascending: true })
      break
    case 'rating':
      dbQuery = dbQuery.order('avg_rating', { ascending: false, nullsFirst: false })
      break
    case 'views':
      dbQuery = dbQuery.order('views_count', { ascending: false, nullsFirst: false })
      break
    case 'featured':
      dbQuery = dbQuery
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
      break
    case 'newest':
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false })
      break
  }

  const { data: businesses, count } = await dbQuery.range(
    offset,
    offset + PER_PAGE - 1,
  )

  const totalPages = count ? Math.ceil(count / PER_PAGE) : 0

  /* ── Build filter-link helper ── */
  const u = (updates: Record<string, string | undefined>) =>
    buildUrl(params, updates)

  /* ══════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* ── Header Bar ── */}
      <div className="bg-gradient-to-r from-[#FF8A00]/20 via-[#FF8A00]/10 to-transparent border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Browse Businesses
          </h1>
          <p className="mt-2 text-white/50">
            Find the best businesses across Bhutan
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Search Bar ── */}
        <div className="mb-8">
          <form action="/browse" method="GET" className="relative">
            {/* Preserve existing params as hidden fields */}
            {Object.entries(params)
              .filter(([k]) => k !== 'q' && k !== 'page')
              .map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v || ''} />
              ))}
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              name="q"
              defaultValue={query || ''}
              placeholder="Search businesses across Bhutan..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-14 pr-4 text-base text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-[#FF8A00]/50 focus:outline-none focus:ring-2 focus:ring-[#FF8A00]/20"
            />
          </form>
        </div>

        {/* ── View Toggle ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href={u({ view: 'grid', page: undefined })}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                view === 'grid'
                  ? 'border-[#FF8A00]/30 bg-[#FF8A00]/10 text-[#FF8A00]'
                  : 'border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Grid</span>
            </Link>
            <Link
              href={u({ view: 'map', page: undefined })}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                view === 'map'
                  ? 'border-[#FF8A00]/30 bg-[#FF8A00]/10 text-[#FF8A00]'
                  : 'border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Map</span>
            </Link>
          </div>
        </div>

        {/* ── Filters Row ── */}
        <div className="mb-8 space-y-4">
          {/* Category pills – visible on md+ */}
          <div className="hidden md:flex flex-wrap items-center gap-2">
            <Link
              href={u({ category: undefined, page: undefined })}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                !categorySlug
                  ? 'bg-[#FF8A00] text-white'
                  : 'border border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              All
            </Link>
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={u({ category: cat.slug, page: undefined })}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  categorySlug === cat.slug
                    ? 'bg-[#FF8A00] text-white'
                    : 'border border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Mobile: Categories in a details/summary dropdown */}
          <details className="md:hidden group">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 transition-all hover:border-white/20">
              <Search className="h-3.5 w-3.5" />
              {categorySlug
                ? categories?.find((c) => c.slug === categorySlug)?.name ??
                  'Categories'
                : 'All Categories'}
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href={u({ category: undefined, page: undefined })}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  !categorySlug
                    ? 'bg-[#FF8A00] text-white'
                    : 'border border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                All
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={u({ category: cat.slug, page: undefined })}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    categorySlug === cat.slug
                      ? 'bg-[#FF8A00] text-white'
                      : 'border border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </details>

          {/* City & Sort row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* City links */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={u({ city: undefined, page: undefined })}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                  !city
                    ? 'border-[#FF8A00]/30 bg-[#FF8A00]/10 text-[#FF8A00]'
                    : 'border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                All Cities
              </Link>
              {uniqueCities.map((c) => (
                <Link
                  key={c}
                  href={u({ city: c, page: undefined })}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                    city === c
                      ? 'border-[#FF8A00]/30 bg-[#FF8A00]/10 text-[#FF8A00]'
                      : 'border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>

            {/* Sort links */}
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={u({ sort: opt.value, page: undefined })}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                    sort === opt.value
                      ? 'border-[#FF8A00]/30 bg-[#FF8A00]/10 text-[#FF8A00]'
                      : 'border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        {(!businesses || businesses.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Search className="h-7 w-7 text-white/30" />
            </div>
            <p className="text-lg font-medium text-white/60">No businesses found</p>
            <p className="mt-1 text-sm text-white/40">
              Try adjusting your filters
            </p>
          </div>
        ) : view === 'map' ? (
          <>
            <p className="mb-6 text-sm text-white/40">
              {count} business{count !== 1 ? 'es' : ''} found
            </p>

            {(() => {
              const mapItems = (businesses as any[]).filter(
                (b) => b.latitude != null && b.longitude != null,
              )

              if (mapItems.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-white/10 bg-white/[0.02]">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <MapPin className="h-7 w-7 text-white/30" />
                    </div>
                    <p className="text-lg font-medium text-white/60">No businesses with map locations</p>
                    <p className="mt-1 text-sm text-white/40">
                      The filtered businesses don&apos;t have coordinates yet
                    </p>
                  </div>
                )
              }

              const avgLat =
                mapItems.reduce((sum: number, b: any) => sum + Number(b.latitude), 0) /
                mapItems.length
              const avgLng =
                mapItems.reduce((sum: number, b: any) => sum + Number(b.longitude), 0) /
                mapItems.length

              return (
                <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-white/10">
                  <ListingMap
                    listings={mapItems}
                    center={[avgLat, avgLng]}
                    zoom={10}
                  />
                </div>
              )
            })()}
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-white/40">
              {count} business{count !== 1 ? 'es' : ''} found
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((biz) => (
                <ListingCard
                  key={biz.id}
                  variant="business"
                  item={biz as Business}
                />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              params={params}
            />
          </>
        )}
      </div>
    </div>
  )
}
