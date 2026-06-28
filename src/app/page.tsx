import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Store, MapPin, Wrench, Briefcase, Star, Shield, Search,
  Building2, ShoppingBag, UtensilsCrossed, Stethoscope, Hotel,
  GraduationCap, ArrowRight, CheckCircle2, Sparkles
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { HeroSearch } from '@/components/ui/HeroSearch'
import { CategoryCard } from '@/components/ui/CategoryCard'
import { ListingCard } from '@/components/ui/ListingCard'
import { SectionHeading } from '@/components/ui/SectionHeading'

// ── Icon map for categories (lucide icons) ──
const categoryIcons: Record<string, LucideIcon> = {
  restaurants: UtensilsCrossed as LucideIcon,
  hotels: Hotel as LucideIcon,
  shopping: ShoppingBag as LucideIcon,
  healthcare: Stethoscope as LucideIcon,
  education: GraduationCap as LucideIcon,
  services: Wrench as LucideIcon,
  real_estate: Building2 as LucideIcon,
  automotive: Store as LucideIcon,
  default: Store as LucideIcon,
}

export default async function HomePage() {
  const supabase = await createServerSupabase()

  // Fetch all data in parallel
  const [
    { data: categories },
    { data: featuredBiz },
    { data: recentClassifieds },
    { data: topServices },
    { data: recentJobs },
    { data: bizCount },
    { data: classifiedCount },
    { data: serviceCount },
    { data: jobCount },
  ] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('businesses')
      .select('id, name, slug, short_description, city, avg_rating, review_count, is_verified, is_featured, cover_image')
      .eq('status', 'approved')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('classifieds')
      .select('id, title, slug, price, price_type, city, condition, images, created_at, categories:classified_categories(name, slug, icon)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('services')
      .select('id, title, slug, price, price_type, city, avg_rating, review_count, short_description, cover_image, is_featured')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('jobs')
      .select('id, title, slug, company_name, city, employment_type, work_type, salary_min, salary_max, salary_currency, salary_period, is_featured, is_urgent, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('classifieds').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  // ── Stats ──
  const stats = [
    { label: 'Businesses', value: Number(bizCount ?? 0), icon: Store, color: '#FF8A00' },
    { label: 'Classifieds', value: Number(classifiedCount ?? 0), icon: ShoppingBag, color: '#2997ff' },
    { label: 'Services', value: Number(serviceCount ?? 0), icon: Wrench, color: '#34c759' },
    { label: 'Jobs', value: Number(jobCount ?? 0), icon: Briefcase, color: '#af52de' },
  ]

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* ═══════════════════════════════════════
          HERO SEARCH
          ═══════════════════════════════════════ */}
      <HeroSearch />

      {/* ═══════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════ */}
      <section className="relative z-10 -mt-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-[#0a0f1a]/95 p-3 shadow-2xl backdrop-blur-xl sm:grid-cols-4">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={`/${stat.label.toLowerCase() === 'businesses' ? 'browse' : stat.label.toLowerCase()}`}
                className="group flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all hover:bg-white/[0.03]"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES
          ═══════════════════════════════════════ */}
      {categories && categories.length > 0 && (
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Browse by Category"
              subtitle={`${categories.length} categories to explore across Bhutan`}
              align="center"
              className="mb-12"
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((cat) => {
                const IconComponent = categoryIcons[cat.slug] || categoryIcons.default
                return (
                  <CategoryCard
                    key={cat.id}
                    name={cat.name}
                    slug={cat.slug}
                    icon={IconComponent}
                  />
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          FEATURED BUSINESSES
          ═══════════════════════════════════════ */}
      {featuredBiz && featuredBiz.length > 0 && (
        <section className="section-padding bg-[#0a0f1a]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Featured Businesses"
              subtitle="Top-rated businesses across Bhutan"
              icon={<Store className="h-4 w-4" />}
              action={{ href: '/browse', label: 'View All' }}
              className="mb-8"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBiz.map((biz) => (
                <ListingCard key={biz.id} variant="business" item={biz as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          RECENT CLASSIFIEDS
          ═══════════════════════════════════════ */}
      {recentClassifieds && recentClassifieds.length > 0 && (
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Recent Classifieds"
              subtitle="Buy and sell across Bhutan"
              icon={<ShoppingBag className="h-4 w-4" />}
              action={{ href: '/classifieds', label: 'View All' }}
              className="mb-8"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recentClassifieds.map((item) => (
                <ListingCard key={item.id} variant="classified" item={item as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          TOP SERVICES
          ═══════════════════════════════════════ */}
      {topServices && topServices.length > 0 && (
        <section className="section-padding bg-[#0a0f1a]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Top Services"
              subtitle="Hire trusted professionals"
              icon={<Wrench className="h-4 w-4" />}
              action={{ href: '/services', label: 'View All' }}
              className="mb-8"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topServices.map((svc) => (
                <ListingCard key={svc.id} variant="service" item={svc as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          LATEST JOBS
          ═══════════════════════════════════════ */}
      {recentJobs && recentJobs.length > 0 && (
        <section className="section-padding">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Latest Jobs"
              subtitle="Find your next opportunity in Bhutan"
              icon={<Briefcase className="h-4 w-4" />}
              action={{ href: '/jobs', label: 'View All' }}
              className="mb-8"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentJobs.map((job) => (
                <ListingCard key={job.id} variant="job" item={job as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════ */}
      <section className="section-padding bg-[#0a0f1a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="How Trishala Works"
            subtitle="Discover, connect, and grow with Bhutan's local directory"
            align="center"
            className="mb-14"
          />
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Discover',
                desc: 'Browse businesses, services, classifieds, and jobs across all 20 dzongkhags of Bhutan.',
                color: '#FF8A00',
              },
              {
                step: '02',
                title: 'Connect',
                desc: 'Contact listing owners directly via phone, email, or WhatsApp — no middleman needed.',
                color: '#2997ff',
              },
              {
                step: '03',
                title: 'Grow',
                desc: 'List your business, post services, sell items, or hire talent. Join the growing Bhutanese community.',
                color: '#34c759',
              },
            ].map((item) => (
              <div key={item.step} className="group relative rounded-2xl border border-white/5 bg-white/[0.03] p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/20 hover:bg-accent-500/[0.03]">
                <div
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.step}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA
          ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#003B82] via-[#0F172A] to-[#003B82] py-20">
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Start Exploring{' '}
            <span className="bg-gradient-to-r from-[#FF8A00] to-[#FFB347] bg-clip-text text-transparent">
              Bhutan
            </span>{' '}
            Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            Whether you&apos;re looking for a restaurant in Thimphu, a plumber in Paro, or
            a job in Phuentsholing — Trishala connects you with all of Bhutan.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF8A00] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/25 transition-all hover:bg-[#E67A00] active:scale-[0.97]"
            >
              <Sparkles className="h-4 w-4" />
              Create Free Account
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 active:scale-[0.97]"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
