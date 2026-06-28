import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, MapPin, Tag, Eye, Clock } from 'lucide-react'
import type { Classified, ClassifiedCategory } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'

export default async function ClassifiedsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const supabase = await createServerSupabase()
  const categorySlug = params.category
  const city = params.city
  const query = params.q

  // ── Build the query ──
  let dbQuery = supabase
    .from('classifieds')
    .select('*, categories:classified_categories(*)', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(24)

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('classified_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    if (cat) {
      dbQuery = dbQuery.eq('category_id', cat.id)
    }
  }

  if (city) dbQuery = dbQuery.eq('city', city)
  if (query) dbQuery = dbQuery.ilike('title', `%${query}%`)

  const { data: classifieds, count } = await dbQuery
  const items = (classifieds || []) as unknown as Classified[]

  // ── Fetch categories ──
  const { data: rawCategories } = await supabase
    .from('classified_categories')
    .select('*')
    .order('name')
  const categories = (rawCategories || []) as ClassifiedCategory[]

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Classifieds</h1>
            <p className="mt-1 text-sm text-white/40">
              Buy, sell, and trade across Bhutan
            </p>
          </div>
          <Link
            href="/classifieds/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#FF8A00] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#E67A00]"
          >
            <Plus className="h-4 w-4" />
            Post an Ad
          </Link>
        </div>

        {/* ── Search ── */}
        <div className="mb-6">
          <form action="/classifieds" method="GET" className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              name="q"
              defaultValue={query || ''}
              placeholder="Search classifieds..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/30 backdrop-blur-sm focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
            />
          </form>
        </div>

        {/* ── Category filters ── */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/classifieds"
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              !categorySlug
                ? 'bg-[#FF8A00] text-white'
                : 'border border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/classifieds?category=${cat.slug}`}
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

        {/* ── Results ── */}
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Tag className="h-6 w-6 text-white/30" />
            </div>
            <p className="text-sm text-white/40">
              No classifieds found. Try a different search or{' '}
              <Link
                href="/classifieds/new"
                className="text-[#FF8A00] hover:underline"
              >
                post one
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-white/40">
              {count} classified{count !== 1 ? 's' : ''} found
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/classifieds/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm transition-all hover:border-[#FF8A00]/20 hover:bg-white/[0.06]"
                >
                  {/* Image area */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#003B82]/20 to-[#0F172A]">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Tag className="h-8 w-8 text-white/20" />
                      </div>
                    )}
                    {/* Condition badge */}
                    <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-medium capitalize text-white/80 backdrop-blur-sm">
                      {item.condition}
                    </span>
                    {/* Price */}
                    {item.price != null && item.price_type !== 'free' ? (
                      <div className="absolute bottom-2 right-2 rounded-full bg-[#FF8A00]/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        Nu. {item.price.toLocaleString()}
                        {item.price_type === 'negotiable' && (
                          <span className="text-[10px] text-white/70"> /nego</span>
                        )}
                      </div>
                    ) : item.price_type === 'free' ? (
                      <div className="absolute bottom-2 right-2 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        Free
                      </div>
                    ) : null}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white transition-colors group-hover:text-[#FF8A00] line-clamp-2">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="mt-1 text-xs text-white/50 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/40">
                      {item.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.city}
                        </span>
                      )}
                      {item.categories && (
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {item.categories.name}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-3 text-[11px] text-white/30">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(item.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.views_count}
                      </span>
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
