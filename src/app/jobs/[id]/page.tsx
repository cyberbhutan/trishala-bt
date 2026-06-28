import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Briefcase,
  Clock,
  Banknote,
  Building2,
  Calendar,
  Mail,
  Globe,
  ExternalLink,
  ChevronLeft,
  TrendingUp,
  Zap,
  Send,
  Users,
  Eye,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import type { Job } from '@/lib/types'
import { applyForJob } from '@/lib/actions/jobs'

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function formatSalary(job: Job): string {
  const currencyMap: Record<string, string> = { BTN: 'Nu.', INR: '₹', USD: '$' }
  const sym = currencyMap[job.salary_currency] || job.salary_currency + ' '

  if (!job.salary_min && !job.salary_max) return 'Negotiable'

  const min = job.salary_min ? `${sym}${job.salary_min.toLocaleString()}` : ''
  const max = job.salary_max ? `${sym}${job.salary_max.toLocaleString()}` : ''
  const range = min && max ? `${min} – ${max}` : min || max

  const periodLabels: Record<string, string> = {
    hourly: '/hour',
    daily: '/day',
    monthly: '/month',
    yearly: '/year',
  }
  return `${range}${periodLabels[job.salary_period] || ''}`
}

function employmentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    'full-time': 'Full-Time',
    'part-time': 'Part-Time',
    contract: 'Contract',
    internship: 'Internship',
    volunteer: 'Volunteer',
  }
  return map[type] || type
}

function workTypeLabel(type: string): string {
  const map: Record<string, string> = {
    'on-site': 'On-Site',
    remote: 'Remote',
    hybrid: 'Hybrid',
  }
  return map[type] || type
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

function deadlineStatus(deadline: string | null): { label: string; color: string } | null {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(diff / 86_400_000)

  if (daysLeft < 0) return { label: 'Expired', color: 'text-red-400' }
  if (daysLeft === 0) return { label: 'Last day to apply', color: 'text-[#FF8A00]' }
  if (daysLeft <= 7) return { label: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`, color: 'text-[#FF8A00]' }
  return { label: formatDate(deadline), color: 'text-white/50' }
}

// ═══════════════════════════════════════════════════════
// Info Row
// ═══════════════════════════════════════════════════════

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
        <Icon className="h-4 w-4 text-white/40" />
      </div>
      <div>
        <p className="text-xs text-white/30">{label}</p>
        {href ? (
          <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="mt-0.5 flex items-center gap-1 text-sm text-white/70 hover:text-[#FF8A00] transition-colors"
          >
            {value}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-white/70">{value}</p>
        )}
      </div>
    </div>
  )

  if (href && href.startsWith('http')) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="block rounded-lg hover:bg-white/[0.02] p-2 -m-2 transition-colors">{content}</a>
  }
  return <div className="block rounded-lg p-2 -m-2">{content}</div>
}

// ═══════════════════════════════════════════════════════
// Section Heading
// ═══════════════════════════════════════════════════════

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-lg font-semibold text-white">
      {children}
    </h2>
  )
}

// ═══════════════════════════════════════════════════════
// Apply Form (Client Component via server action)
// ═══════════════════════════════════════════════════════

function ApplyForm({ job }: { job: Job }) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-6">
      <h3 className="text-lg font-semibold text-white">
        {job.application_url ? 'Apply Externally' : 'Apply for this Job'}
      </h3>
      <p className="mt-1 text-sm text-white/40">
        {job.application_url
          ? 'This employer uses an external application system.'
          : 'Fill out the form below to apply.'}
      </p>

      {job.application_url ? (
        <a
          href={job.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A00] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/20 transition-all hover:bg-[#E67A00]"
        >
          <ExternalLink className="h-4 w-4" /> Apply on External Site
        </a>
      ) : (
        <form action={applyForJob} className="mt-4 space-y-4">
          <input type="hidden" name="job_id" value={job.id} />
          <div>
            <label htmlFor="applicant_name" className="block text-sm font-medium text-white/70">Full Name *</label>
            <input
              id="applicant_name"
              name="applicant_name"
              required
              className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
              placeholder="Your full name"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="applicant_email" className="block text-sm font-medium text-white/70">Email *</label>
              <input
                id="applicant_email"
                name="applicant_email"
                type="email"
                required
                className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="applicant_phone" className="block text-sm font-medium text-white/70">Phone</label>
              <input
                id="applicant_phone"
                name="applicant_phone"
                type="tel"
                className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
                placeholder="+975 17 123456"
              />
            </div>
          </div>
          <div>
            <label htmlFor="cover_letter" className="block text-sm font-medium text-white/70">Cover Letter</label>
            <textarea
              id="cover_letter"
              name="cover_letter"
              rows={4}
              className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
              placeholder="Tell the employer why you're a good fit..."
            />
          </div>
          <div>
            <label htmlFor="resume_url" className="block text-sm font-medium text-white/70">Resume / CV Link</label>
            <input
              id="resume_url"
              name="resume_url"
              type="url"
              className="mt-1 block w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-white/25 backdrop-blur-sm transition-all focus:border-[#FF8A00]/40 focus:outline-none focus:ring-1 focus:ring-[#FF8A00]/20"
              placeholder="https://drive.google.com/..."
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF8A00] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/20 transition-all hover:bg-[#E67A00]"
          >
            <Send className="h-4 w-4" /> Submit Application
          </button>
        </form>
      )}

      {job.application_email && !job.application_url && (
        <div className="mt-4 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
          <p className="text-xs text-white/30">Alternatively, send your application via email:</p>
          <a
            href={`mailto:${job.application_email}`}
            className="mt-1 flex items-center gap-2 text-sm text-[#FF8A00] hover:underline"
          >
            <Mail className="h-3.5 w-3.5" /> {job.application_email}
          </a>
        </div>
      )}

      {job.application_deadline && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#FF8A00]/10 bg-[#FF8A00]/[0.03] p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#FF8A00]" />
          <p className="text-xs text-white/50">
            Applications close{' '}
            <span className="text-white/70">{formatDate(job.application_deadline)}</span>
          </p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Page Component
// ═══════════════════════════════════════════════════════

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: job } = await supabase
    .from('jobs')
    .select('*, categories:job_categories(*)')
    .eq('id', Number(id))
    .single()

  if (!job) notFound()

  const typedJob = job as unknown as Job
  const deadline = deadlineStatus(typedJob.application_deadline)
  const reqList = typedJob.requirements
    ? typedJob.requirements.split('\n').filter((l) => l.trim())
    : []
  const respList = typedJob.responsibilities
    ? typedJob.responsibilities.split('\n').filter((l) => l.trim())
    : []
  const descParagraphs = typedJob.description
    ? typedJob.description.split('\n').filter((l) => l.trim())
    : []

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Top bar */}
      <div className="border-b border-white/[0.04]">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Jobs
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* ─── Main Content ─── */}
          <div className="space-y-8">
            {/* Header Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.03] p-8">
              {/* Glow */}
              <div className="pointer-events-none absolute -inset-px">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF8A00]/5 via-transparent to-transparent" />
              </div>

              <div className="relative">
                {/* Badges */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {typedJob.is_featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF8A00]/20 to-[#FFB347]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FF8A00]">
                      <TrendingUp className="h-3.5 w-3.5" /> Featured
                    </span>
                  )}
                  {typedJob.is_urgent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-400">
                      <Zap className="h-3.5 w-3.5" /> Urgent
                    </span>
                  )}
                  {deadline && (
                    <span className={cn('inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-3 py-1 text-[11px]', deadline.color)}>
                      <Calendar className="h-3.5 w-3.5" /> {deadline.label}
                    </span>
                  )}
                </div>

                {/* Company + Title */}
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8A00]/10 to-[#003B82]/10 text-2xl font-bold text-[#FF8A00] ring-1 ring-white/[0.06]">
                    {typedJob.company_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-white/50">{typedJob.company_name}</p>
                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                      {typedJob.title}
                    </h1>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Briefcase className="h-4 w-4 text-white/30" />
                    {employmentTypeLabel(typedJob.employment_type)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Clock className="h-4 w-4 text-white/30" />
                    {workTypeLabel(typedJob.work_type)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <MapPin className="h-4 w-4 text-white/30" />
                    {typedJob.city || typedJob.location || 'Location not specified'}
                  </div>
                  {typedJob.salary_min || typedJob.salary_max ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-[#FF8A00]">
                      <Banknote className="h-4 w-4" />
                      {formatSalary(typedJob)}
                    </div>
                  ) : null}
                </div>

                {/* Stats */}
                <div className="mt-6 flex items-center gap-4 border-t border-white/[0.04] pt-4 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {typedJob.views_count} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {typedJob.application_count} applicants
                  </span>
                  <span>Posted {timeAgo(typedJob.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-8">
              <SectionHeading>About This Role</SectionHeading>
              <div className="space-y-4 text-sm leading-relaxed text-white/60">
                {descParagraphs.length > 0 ? (
                  descParagraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                ) : (
                  <p className="italic text-white/30">No description provided</p>
                )}
              </div>
            </div>

            {/* Responsibilities */}
            {respList.length > 0 && (
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-8">
                <SectionHeading>Key Responsibilities</SectionHeading>
                <ul className="space-y-3">
                  {respList.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF8A00]/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {reqList.length > 0 && (
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-8">
                <SectionHeading>Requirements</SectionHeading>
                <ul className="space-y-3">
                  {reqList.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF8A00]/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-6">
              <SectionHeading>Job Details</SectionHeading>
              <div className="space-y-4">
                <InfoRow
                  icon={Building2}
                  label="Company"
                  value={typedJob.company_name}
                />
                <InfoRow
                  icon={Briefcase}
                  label="Employment Type"
                  value={employmentTypeLabel(typedJob.employment_type)}
                />
                <InfoRow
                  icon={Clock}
                  label="Work Type"
                  value={workTypeLabel(typedJob.work_type)}
                />
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={typedJob.city || typedJob.location || 'Not specified'}
                />
                {(typedJob.salary_min || typedJob.salary_max) && (
                  <InfoRow
                    icon={Banknote}
                    label="Salary"
                    value={formatSalary(typedJob)}
                  />
                )}
                {typedJob.categories && (
                  <InfoRow
                    icon={TrendingUp}
                    label="Category"
                    value={typedJob.categories.name}
                  />
                )}
                <InfoRow
                  icon={Calendar}
                  label="Posted"
                  value={formatDate(typedJob.created_at)}
                />
                {typedJob.application_deadline && (
                  <InfoRow
                    icon={AlertCircle}
                    label="Deadline"
                    value={formatDate(typedJob.application_deadline)}
                  />
                )}
              </div>
            </div>

            {/* How to Apply */}
            <ApplyForm job={typedJob} />
          </div>
        </div>
      </div>
    </div>
  )
}
