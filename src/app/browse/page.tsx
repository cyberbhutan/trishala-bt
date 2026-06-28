import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin, Star, Search } from 'lucide-react'

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

  let dbQuery = supabase
    .from('businesses')
    .select(`
      *,
      categories:business_categories(categories(id, name, slug, icon))
    `, { count: 'exact' })
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(24)

  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) {
      dbQuery = dbQuery.contains('categories', [{ id: cat.id }])
    }
  }

  if (city) dbQuery = dbQuery.eq('city', city)
  if (query) dbQuery = dbQuery.ilike('name', `%${query}%`)

  const { data: businesses, count } = await dbQuery

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <form action="/browse" method="GET" className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
            <input
              type="text" name="q" defaultValue={query || ''}
              placeholder="Search businesses across Bhutan..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/30 backdrop-blur-sm focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
            />
          </form>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/browse"
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              !categorySlug ? 'bg-[#FF8A00] text-white' : 'border border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            All
          </Link>
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/browse?category=${cat.slug}`}
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

        {/* Results */}
        {(!businesses || businesses.length === 0) ? (
          <div className="py-20 text-center">
            <p className="text-white/40">No businesses found. Try a different search.</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-white/40">{count} business{count !== 1 ? 'es' : ''} found</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((biz: any) => (
                <Link
                  key={biz.id}
                  href={`/business/${biz.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all hover:border-[#FF8A00]/20 hover:bg-white/[0.06]"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#003B82]/20 to-[#0F172A]" />
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      {biz.is_featured && (
                        <span className="rounded bg-[#FF8A00]/10 px-2 py-0.5 text-[10px] font-medium text-[#FF8A00]">Featured</span>
                      )}
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#FF8A00]">{biz.name}</h3>
                    </div>
                    {biz.short_description && (
                      <p className="mt-1 text-sm text-white/50 line-clamp-2">{biz.short_description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                      {biz.city && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {biz.city}</span>
                      )}
                      {biz.avg_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[#FF8A00] text-[#FF8A00]" />
                          {biz.avg_rating.toFixed(1)}
                        </span>
                      )}
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
