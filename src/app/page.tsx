import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Search, Star, TrendingUp, Users, Shield } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createServerSupabase()

  // Fetch featured businesses
  const { data: featured } = await supabase
    .from('businesses')
    .select(`
      *,
      categories:business_categories(categories(id, name, slug, icon))
    `)
    .eq('status', 'approved')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#003B82] to-[#0F172A]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-[#FF8A00]" />
              Discover businesses across Bhutan
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Find the Best{' '}
              <span className="bg-gradient-to-r from-[#FF8A00] to-[#FFB347] bg-clip-text text-transparent">
                Businesses
              </span>{' '}
              in Bhutan
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
              The ultimate business directory for Bhutan. Discover, connect, and support local businesses from Thimphu to Trashigang.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/browse"
                className="rounded-xl bg-[#FF8A00] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/25 transition-all hover:bg-[#E67A00] hover:shadow-xl hover:shadow-[#FF8A00]/30"
              >
                Browse Businesses
              </Link>
              <Link
                href="/business/listings"
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                List Your Business
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F172A] to-transparent" />
      </section>

      {/* CATEGORIES */}
      <section className="bg-[#0F172A] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Browse by Category</h2>
            <p className="mt-2 text-white/60">Find what you need, fast</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-6 text-center transition-all hover:border-[#FF8A00]/20 hover:bg-[#FF8A00]/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF8A00]/10 text-[#FF8A00] transition-all group-hover:bg-[#FF8A00]/20">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white/80 group-hover:text-white">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured && featured.length > 0 && (
        <section className="bg-[#0a0f1a] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Featured Businesses</h2>
                <p className="mt-1 text-white/60">Top-rated businesses in Bhutan</p>
              </div>
              <Link href="/browse" className="text-sm font-medium text-[#FF8A00] hover:text-[#E67A00]">
                View All →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/business/${biz.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all hover:border-[#FF8A00]/20 hover:bg-white/[0.06]"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#003B82]/20 to-[#0F172A]">
                    {biz.cover_image && (
                      <img src={biz.cover_image} alt={biz.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      {biz.is_verified && (
                        <span className="rounded-full bg-blue-500/10 p-1">
                          <Shield className="h-3 w-3 text-blue-400" />
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#FF8A00]">{biz.name}</h3>
                    </div>
                    <p className="mt-1 text-sm text-white/50 line-clamp-2">{biz.short_description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                      {biz.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {biz.city}
                        </span>
                      )}
                      {biz.avg_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[#FF8A00] text-[#FF8A00]" />
                          {biz.avg_rating.toFixed(1)} ({biz.review_count})
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="bg-[#0F172A] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Why Trishala?</h2>
            <p className="mt-2 text-white/60">The smartest way to find and grow businesses in Bhutan</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Search, title: 'Easy Discovery', desc: 'Find restaurants, shops, services, and more across all of Bhutan with smart search and filters.' },
              { icon: Star, title: 'Honest Reviews', desc: 'Real reviews from real customers. Make informed decisions with transparent ratings.' },
              { icon: TrendingUp, title: 'Grow Your Business', desc: 'List your business for free and reach thousands of potential customers across Bhutan.' },
              { icon: Users, title: 'Local Community', desc: 'Support local businesses and strengthen communities from Thimphu to the eastern dzongkhags.' },
              { icon: MapPin, title: 'Location Based', desc: 'Find businesses near you with maps, directions, and area-based search.' },
              { icon: Shield, title: 'Verified Listings', desc: 'Every business is reviewed before going live. Quality and trust guaranteed.' },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition-all hover:border-[#FF8A00]/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8A00]/10 text-[#FF8A00]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#003B82] to-[#0F172A] py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Own a Business in Bhutan?</h2>
          <p className="mt-4 text-lg text-white/70">
            List your business for free and start getting discovered by thousands of potential customers.
          </p>
          <Link
            href="/business/listings"
            className="mt-8 inline-flex items-center rounded-xl bg-[#FF8A00] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/25 transition-all hover:bg-[#E67A00]"
          >
            List Your Business Free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0f1a] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">Trishala</span>
              <span className="text-sm text-white/40">.bt</span>
            </div>
            <p className="text-sm text-white/40">
              © 2026 Trishala. All rights reserved. Made with ❤️ in Bhutan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
