import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Banknote,
  Building2,
  ChevronRight,
  TrendingUp,
  Zap,
  Filter,
  ArrowUpDown,
} from 'lucide-react'
import { formatDate, cn, BHUTAN_CITIES } from '@/lib/utils'
import type { Job, JobCategory } from '@/lib/types'

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

interface SearchParams {
  search?: string
  category?: string
  type?: string
  city?: string
  page?: string
}

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
] as const

function formatSalary(job: Job): string {
  const currencyMap: Record<string, string> = { BTN: 'Nu.', INR: '₹', USD: '$' }
  const sym = currencyMap[job.salary_currency] || job.salary_currency + ' '

  if (!job.salary_min && !job.salary_max) return 'Negotiable'

  const min = job.salary_min ? `${sym}${job.salary_min.toLocaleString()}` : ''
  const max = job.salary_max ? `${sym}${job.salary_max.toLocaleString()}` : ''
  const range = min && max ? `${min} – ${max}` : min || max

  const periodLabels: Record<string, string> = {
    hourly: '/hr',
    daily: '/day',
    monthly: '/mo',
    yearly: '/yr',
  }
  return `${range}${periodLabels[job.salary_period] || ''}`
}

function getTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

// ═══════════════════════════════════════════════════════
// Job Card
// ═══════════════════════════════════════════════════════

function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 transition-all duration-300 hover:border-[#FF8A00]/20 hover:bg-[#FF8A00]/[0.03] hover:shadow-[0_0_30px_-5px_rgba(255,138,0,0.1)]">
        {/* Orange glow on hover */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF8A00]/5 via-transparent to-transparent" />
        </div>

        <div className="relative">
          {/* Top row: badge + urgent */}
          <div className="mb-3 flex items-center gap-2">
            {job.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF8A00]/20 to-[#FFB347]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FF8A00]">
                <TrendingUp className="h-3 w-3" /> Featured
              </span>
            )}
            {job.is_urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                <Zap className="h-3 w-3" /> Urgent
              </span>
            )}
          </div>

          {/* Company + Title */}
          <div className="mb-3 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8A00]/10 to-[#003B82]/10 text-lg font-bold text-[#FF8A00] ring-1 ring-white/[0.06]">
              {job.company_name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/50">{job.company_name}</p>
              <h3 className="mt-0.5 truncate text-lg font-semibold text-white group-hover:text-[#FF8A00] transition-colors">
                {job.title}
              </h3>
            </div>
          </div>

          {/* Meta chips */}
          <div className="mb-4 flex flex-wrap gap-2">
            {job.employment_type && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-white/50">
                <Briefcase className="h-3 w-3" />
                {job.employment_type.charAt(0).toUpperCase() + job.employment_type.slice(1)}
              </span>
            )}
            {job.work_type && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-white/50">
                <Clock className="h-3 w-3" />
                {job.work_type === 'on-site'
                  ? 'On-Site'
                  : job.work_type === 'remote'
                    ? 'Remote'
                    : 'Hybrid'}
              </span>
            )}
            {job.city && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-white/50">
                <MapPin className="h-3 w-3" />
                {job.city}
              </span>
            )}
          </div>

          {/* Salary */}
          <div className="mb-4 flex items-center gap-1.5 text-sm font-medium text-[#FF8A00]">
            <Banknote className="h-4 w-4" />
            {formatSalary(job)}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.04] pt-4">
            <span className="text-xs text-white/30">{getTimeAgo(job.created_at)}</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-white/40 transition-colors group-hover:text-[#FF8A00]">
              View details <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════
// Filter Sidebar
// ═══════════════════════════════════════════════════════

function FilterSidebar({
  categories,
  current,
}: {
  categories: JobCategory[]
  current: SearchParams
}) {
  function buildUrl(updates: Partial<SearchParams>): string {
    const params = new URLSearchParams()
    const merged = { ...current, ...updates }
    for (const [k, v] of Object.entries(merged)) {
      if (v && k !== 'page') params.set(k, v)
    }
    const qs = params.toString()
    return `/jobs${qs ? `?${qs}` : ''}`
  }

  return (
    <aside className="space-y-8">
      {/* Search */}
      <form action="/jobs" method="GET">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            name="search"
            defaultValue={current.search || ''}
            placeholder="Search jobs..."
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
          />
        </div>
      </form>

      {/* Category filter */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Category</h4>
        <div className="space-y-1">
          <Link
            href={buildUrl({ category: undefined })}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
              !current.category
                ? 'bg-[#FF8A00]/10 text-[#FF8A00] font-medium'
                : 'text-white/50 hover:bg-white/[0.03] hover:text-white/70'
            )}
          >
            <Filter className="h-3.5 w-3.5" /> All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildUrl({ category: current.category === cat.slug ? undefined : cat.slug })}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
                current.category === cat.slug
                  ? 'bg-[#FF8A00]/10 text-[#FF8A00] font-medium'
                  : 'text-white/50 hover:bg-white/[0.03] hover:text-white/70'
              )}
            >
              {cat.icon || <ChevronRight className="h-3 w-3 opacity-40" />}
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Employment type filter */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">Type</h4>
        <div className="space-y-1">
          <Link
            href={buildUrl({ type: undefined })}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
              !current.type
                ? 'bg-[#FF8A00]/10 text-[#FF8A00] font-medium'
                : 'text-white/50 hover:bg-white/[0.03] hover:text-white/70'
            )}
          >
            All Types
          </Link>
          {EMPLOYMENT_TYPES.map((et) => (
            <Link
              key={et.value}
              href={buildUrl({ type: current.type === et.value ? undefined : et.value })}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
                current.type === et.value
                  ? 'bg-[#FF8A00]/10 text-[#FF8A00] font-medium'
                  : 'text-white/50 hover:bg-white/[0.03] hover:text-white/70'
              )}
            >
              {et.label}
            </Link>
          ))}
        </div>
      </div>

      {/* City filter */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">City</h4>
        <div className="max-h-48 space-y-1 overflow-y-auto">
          <Link
            href={buildUrl({ city: undefined })}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
              !current.city
                ? 'bg-[#FF8A00]/10 text-[#FF8A00] font-medium'
                : 'text-white/50 hover:bg-white/[0.03] hover:text-white/70'
            )}
          >
            All Cities
          </Link>
          {BHUTAN_CITIES.map((c) => (
            <Link
              key={c}
              href={buildUrl({ city: current.city === c ? undefined : c })}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
                current.city === c
                  ? 'bg-[#FF8A00]/10 text-[#FF8A00] font-medium'
                  : 'text-white/50 hover:bg-white/[0.03] hover:text-white/70'
              )}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

// ═══════════════════════════════════════════════════════
// Pagination
// ═══════════════════════════════════════════════════════

function Pagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number
  totalPages: number
  params: SearchParams
}) {
  function buildPageUrl(p: number): string {
    const merged = { ...params, page: String(p) }
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v)
    }
    return `/jobs?${sp.toString()}`
  }

  if (totalPages <= 1) return null

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={buildPageUrl(p)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all',
            p === currentPage
              ? 'bg-[#FF8A00] text-white font-medium'
              : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/70'
          )}
        >
          {p}
        </Link>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const supabase = await createServerSupabase()

  // Fetch categories and jobs in parallel
  const [{ data: categories }, { data: jobsResult, count }] = await Promise.all([
    supabase.from('job_categories').select('*').order('name'),
    supabase
      .from('jobs')
      .select('*, categories:job_categories(*)', { count: 'exact' })
      .eq('status', 'active')
      .then((q) => {
        // Apply filters
        let query = q

        // Category filter
        if (params.category) {
          // Need to find category id from slug
          return (async () => {
            const catId = categories?.find((c) => c.slug === params.category)?.id
            let inner = supabase
              .from('jobs')
              .select('*, categories:job_categories(*)', { count: 'exact' })
              .eq('status', 'active')
            if (catId) inner = inner.eq('category_id', catId)
            if (params.type) inner = inner.eq('employment_type', params.type)
            if (params.city) inner = inner.eq('city', params.city)
            if (params.search) {
              inner = inner.or(
                `title.ilike.%${params.search}%,description.ilike.%${params.search}%,company_name.ilike.%${params.search}%`
              )
            }
            const page = Number(params.page) || 1
            const limit = 12
            const offset = (page - 1) * limit
            return inner
              .order('is_featured', { ascending: false })
              .order('is_urgent', { ascending: false })
              .order('created_at', { ascending: false })
              .range(offset, offset + limit - 1)
          })()
        }

        let inner = supabase
          .from('jobs')
          .select('*, categories:job_categories(*)', { count: 'exact' })
          .eq('status', 'active')
        if (params.type) inner = inner.eq('employment_type', params.type)
        if (params.city) inner = inner.eq('city', params.city)
        if (params.search) {
          inner = inner.or(
            `title.ilike.%${params.search}%,description.ilike.%${params.search}%,company_name.ilike.%${params.search}%`
          )
        }
        const page = Number(params.page) || 1
        const limit = 12
        const offset = (page - 1) * limit
        return inner
          .order('is_featured', { ascending: false })
          .order('is_urgent', { ascending: false })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)
      }),
  ])

  const jobs = (jobsResult || []) as unknown as Job[]
  const total = count || 0
  const currentPage = Number(params.page) || 1
  const limit = 12
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF8A00]/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Find Your{' '}
              <span className="bg-gradient-to-r from-[#FF8A00] to-[#FFB347] bg-clip-text text-transparent">
                Next Opportunity
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-white/40">
              Browse job openings from top companies across Bhutan
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-64">
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 backdrop-blur-sm">
              <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-white/[0.03]" />}>
                <FilterSidebar
                  categories={(categories || []) as JobCategory[]}
                  current={params}
                />
              </Suspense>
            </div>
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Results header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">
                  {total} job{total !== 1 ? 's' : ''} found
                  {params.search && (
                    <>
                      {' '}for &ldquo;<span className="text-white/60">{params.search}</span>&rdquo;
                    </>
                  )}
                </p>
              </div>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF8A00] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF8A00]/20 transition-all hover:bg-[#E67A00] hover:shadow-[#FF8A00]/30"
              >
                <Building2 className="h-4 w-4" /> Post a Job
              </Link>
            </div>

            {/* Job grid */}
            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.06] p-16 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-white/20" />
                <h3 className="mt-4 text-lg font-medium text-white/40">No jobs found</h3>
                <p className="mt-1 text-sm text-white/30">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} params={params} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
