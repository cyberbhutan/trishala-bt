import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import { Store, MapPin, Wrench, Briefcase, Star, TrendingUp, Users, Shield, ArrowRight, Search } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createServerSupabase()

  // Fetch data from all 4 sections
  const [
    { data: categories },
    { data: featuredBiz },
    { data: recentClassifieds },
    { data: topServices },
    { data: recentJobs },
  ] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('businesses').select('id, name, slug, short_description, city, avg_rating, review_count, is_verified, cover_image, is_featured').eq('status', 'approved').eq('is_featured', true).order('created_at', { ascending: false }).limit(6),
    supabase.from('classifieds').select('id, title, slug, price, price_type, city, condition, images, created_at, categories:classified_categories(name, slug, icon)').eq('status', 'active').order('created_at', { ascending: false }).limit(8),
    supabase.from('services').select('id, title, slug, price, price_type, city, avg_rating, review_count, short_description, cover_image, is_featured').eq('status', 'approved').order('created_at', { ascending: false }).limit(6),
    supabase.from('jobs').select('id, title, slug, company_name, city, employment_type, work_type, salary_min, salary_max, salary_currency, salary_period, is_featured, is_urgent, created_at').eq('status', 'active').order('created_at', { ascending: false }).limit(6),
  ])

  return (
    <div>
      {/* ═══════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#003B82] to-[#0F172A]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
              <MapPin className="h-4 w-4 text-[#FF8A00]" />
              Bhutan&apos;s All-in-One Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Find, Buy, Hire, Work.{' '}
              <span className="bg-gradient-to-r from-[#FF8A00] to-[#FFB347] bg-clip-text text-transparent">
                All in Bhutan
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
              The only platform you need. Discover businesses, buy and sell, hire services, and find jobs — from Thimphu to Trashigang.
            </p>
            {/* Quick Search */}
            <div className="mx-auto mt-10 max-w-xl">
              <form action="/browse" method="GET" className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input
                  type="text" name="q"
                  placeholder="Search anything in Bhutan..."
                  className="w-full rounded-2xl border border-white/10 bg-white/10 py-4 pl-12 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-sm focus:border-[#FF8A00]/50 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/30"
                />
              </form>
            </div>
            {/* Quick links */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/browse" className="rounded-xl bg-[#FF8A00] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/25 transition-all hover:bg-[#E67A00]">
                Browse Businesses
              </Link>
              <Link href="/classifieds" className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10">
                Browse Classifieds
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F172A] to-transparent" />
      </section>

      {/* ═══════════════════════════════════════
          SECTION NAV — Quick Access
          ═══════════════════════════════════════ */}
      <section className="relative -mt-10 z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-[#0a0f1a] p-3 shadow-2xl sm:grid-cols-4">
          {[
            { href: '/browse', icon: Store, label: 'Businesses', desc: 'Find local businesses', color: '#FF8A00' },
            { href: '/classifieds', icon: MapPin, label: 'Classifieds', desc: 'Buy & sell items', color: '#2997ff' },
            { href: '/services', icon: Wrench, label: 'Services', desc: 'Hire professionals', color: '#34c759' },
            { href: '/jobs', icon: Briefcase, label: 'Jobs', desc: 'Find work', color: '#af52de' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center gap-2 rounded-xl p-5 text-center transition-all hover:bg-white/[0.03]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-[11px] text-white/40">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES
          ═══════════════════════════════════════ */}
      <section className="bg-[#0F172A] py-20">
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
                  <Store className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white/80 group-hover:text-white">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED BUSINESSES
          ═══════════════════════════════════════ */}
      {featuredBiz && featuredBiz.length > 0 && (
        <section className="bg-[#0a0f1a] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#FF8A00]" />
                  <h2 className="text-2xl font-bold text-white">Featured Businesses</h2>
                </div>
                <p className="mt-1 text-sm text-white/60">Top-rated businesses across Bhutan</p>
              </div>
              <Link href="/browse" className="flex items-center gap-1 text-sm font-medium text-[#FF8A00] hover:text-[#E67A00]">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBiz.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/business/${biz.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all hover:border-[#FF8A00]/20 hover:bg-white/[0.06]"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#003B82]/20 to-[#0F172A]">
                    {biz.cover_image && <img src={biz.cover_image} alt={biz.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      {biz.is_verified && <Shield className="h-3.5 w-3.5 text-blue-400" />}
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#FF8A00]">{biz.name}</h3>
                    </div>
                    <p className="mt-1 text-sm text-white/50 line-clamp-2">{biz.short_description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                      {biz.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {biz.city}</span>}
                      {biz.avg_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-[#FF8A00] text-[#FF8A00]" />
                          {Number(biz.avg_rating).toFixed(1)}
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

      {/* ═══════════════════════════════════════
          RECENT CLASSIFIEDS
          ═══════════════════════════════════════ */}
      {recentClassifieds && recentClassifieds.length > 0 && (
        <section className="bg-[#0F172A] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#2997ff]" />
                  <h2 className="text-2xl font-bold text-white">Recent Classifieds</h2>
                </div>
                <p className="mt-1 text-sm text-white/60">Buy and sell across Bhutan</p>
              </div>
              <Link href="/classifieds" className="flex items-center gap-1 text-sm font-medium text-[#FF8A00] hover:text-[#E67A00]">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentClassifieds.map((item) => (
                <Link
                  key={item.id}
                  href={`/classifieds/${item.id}`}
                  className="group rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-[#2997ff]/20"
                >
                  <div className="mb-3 flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-br from-[#003B82]/10 to-[#0F172A]">
                    {item.images?.[0] && (
                      <img src={item.images[0]} alt={item.title} className="h-full w-full rounded-xl object-cover" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#2997ff]">{item.title}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#FF8A00]">
                      {item.price ? `Nu. ${Number(item.price).toLocaleString()}` : item.price_type === 'free' ? 'Free' : 'Negotiable'}
                    </span>
                    <span className="text-[11px] text-white/30 capitalize">{item.condition?.replace('-', ' ')}</span>
                  </div>
                  {item.city && <p className="mt-1 text-[11px] text-white/40">{item.city}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          TOP SERVICES
          ═══════════════════════════════════════ */}
      {topServices && topServices.length > 0 && (
        <section className="bg-[#0a0f1a] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-[#34c759]" />
                  <h2 className="text-2xl font-bold text-white">Top Services</h2>
                </div>
                <p className="mt-1 text-sm text-white/60">Hire trusted professionals</p>
              </div>
              <Link href="/services" className="flex items-center gap-1 text-sm font-medium text-[#FF8A00] hover:text-[#E67A00]">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topServices.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/services/${svc.id}`}
                  className="group rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-[#34c759]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34c759]/10 text-[#34c759]">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-[#34c759]">{svc.title}</h3>
                      <p className="text-xs text-white/40">Service</p>
                    </div>
                  </div>
                  {svc.short_description && (
                    <p className="mt-3 text-xs text-white/50 line-clamp-2">{svc.short_description}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-medium text-[#FF8A00]">
                      {svc.price ? `Nu. ${Number(svc.price)}${svc.price_type === 'hourly' ? '/hr' : ''}` : svc.price_type === 'free' ? 'Free' : 'Quote'}
                    </span>
                    <span className="flex items-center gap-1 text-white/40">
                      <Star className="h-3 w-3 fill-[#FF8A00] text-[#FF8A00]" />
                      {Number(svc.avg_rating).toFixed(1)} ({svc.review_count})
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          RECENT JOBS
          ═══════════════════════════════════════ */}
      {recentJobs && recentJobs.length > 0 && (
        <section className="bg-[#0F172A] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#af52de]" />
                  <h2 className="text-2xl font-bold text-white">Latest Jobs</h2>
                </div>
                <p className="mt-1 text-sm text-white/60">Find your next opportunity in Bhutan</p>
              </div>
              <Link href="/jobs" className="flex items-center gap-1 text-sm font-medium text-[#FF8A00] hover:text-[#E67A00]">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-8 space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-[#af52de]/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#af52de]/10 text-[#af52de]">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white group-hover:text-[#af52de]">{job.title}</h3>
                        {job.is_urgent && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">Urgent</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-white/50">{job.company_name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/40">
                        {job.city && <span>{job.city}</span>}
                        <span className="capitalize">{job.employment_type?.replace('-', ' ')}</span>
                        <span className="capitalize">{job.work_type?.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    {job.salary_min && (
                      <p className="text-sm font-semibold text-white/70">
                        Nu. {Number(job.salary_min).toLocaleString()}{job.salary_max ? ` - ${Number(job.salary_max).toLocaleString()}` : ''}
                      </p>
                    )}
                    <p className="text-[11px] text-white/30 capitalize">{job.salary_period}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          WHY TRISHALA
          ═══════════════════════════════════════ */}
      <section className="bg-[#0a0f1a] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Why Trishala?</h2>
            <p className="mt-2 text-white/60">The only platform you need in Bhutan</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Store, title: 'Find Businesses', desc: 'Discover verified local businesses from every dzongkhag in Bhutan.' },
              { icon: MapPin, title: 'Buy & Sell', desc: 'Post classifieds for free. Sell your items, find what you need.' },
              { icon: Wrench, title: 'Hire Services', desc: 'Book trusted service providers — plumbers, tutors, drivers, and more.' },
              { icon: Briefcase, title: 'Find Jobs', desc: 'Browse job openings across Bhutan. Apply directly on the platform.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8A00]/20 to-[#003B82]/20 text-[#FF8A00]">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA
          ═══════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-[#003B82] to-[#0F172A] py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Start Exploring Bhutan Today</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Whether you&apos;re looking for a restaurant in Thimphu, a plumber in Paro, or a job in Phuentsholing — Trishala connects you with all of Bhutan.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/register" className="rounded-xl bg-[#FF8A00] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/25 transition-all hover:bg-[#E67A00]">
              Create Free Account →
            </Link>
            <Link href="/browse" className="rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10">
              Browse Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
