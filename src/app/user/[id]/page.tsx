import { createServerSupabase } from '@/lib/supabase/server'
import type { Business, Classified, ServiceListing, Job } from '@/lib/types'
import { ListingCard } from '@/components/ui/ListingCard'
import Link from 'next/link'
import { ArrowLeft, Calendar, Mail, Phone, Store, AlertTriangle } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   Page Props
   ═══════════════════════════════════════════════════════════════════ */

interface UserPageProps {
  params: Promise<{ id: string }>
}

/* ═══════════════════════════════════════════════════════════════════
   Helper: Get initials from name
   ═══════════════════════════════════════════════════════════════════ */

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/* ═══════════════════════════════════════════════════════════════════
   Helper: Format date
   ═══════════════════════════════════════════════════════════════════ */

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/* ═══════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════ */

export default async function UserProfilePage({ params }: UserPageProps) {
  const { id } = await params
  const supabase = await createServerSupabase()

  // ── Fetch profile ──
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle className="mb-4 h-12 w-12 text-white/20" />
            <h1 className="text-2xl font-bold text-white">User not found</h1>
            <p className="mt-2 text-sm text-white/40">
              The user profile you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF8A00] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#FF8A00]/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Fetch user's listings ──
  const [
    { data: businesses },
    { data: classifieds },
    { data: services },
    { data: jobs },
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', id)
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('classifieds')
      .select('*')
      .eq('user_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('services')
      .select('*')
      .eq('provider_id', id)
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
  ])

  const initials = getInitials(profile.full_name)

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Back link ── */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* ═══════════════════════════════════════════════════════
           Profile Header
           ═══════════════════════════════════════════════════════ */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8A00] to-[#FF6B00] text-2xl font-bold text-white shadow-lg shadow-[#FF8A00]/20">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">
                {profile.full_name || 'Unnamed User'}
              </h1>

              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-white/40">
                <Calendar className="h-3.5 w-3.5" />
                Member since{' '}
                {formatDate(profile.created_at || profile.updated_at || new Date().toISOString())}
              </p>

              {/* Contact info */}
              {(profile.phone || (profile as any).email) && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#FF8A00]" />
                      {profile.phone}
                    </a>
                  )}
                  {(profile as any).email && (
                    <a
                      href={`mailto:${(profile as any).email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#FF8A00]" />
                      {(profile as any).email}
                    </a>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-5 sm:justify-start">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {businesses?.length || 0}
                  </p>
                  <p className="text-[11px] text-white/40">Businesses</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {services?.length || 0}
                  </p>
                  <p className="text-[11px] text-white/40">Services</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {classifieds?.length || 0}
                  </p>
                  <p className="text-[11px] text-white/40">Classifieds</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {jobs?.length || 0}
                  </p>
                  <p className="text-[11px] text-white/40">Jobs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
           Sections
           ═══════════════════════════════════════════════════════ */}

        {/* ── Businesses ── */}
        {businesses && businesses.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-accent-500" />
              <h2 className="text-lg font-semibold text-white">Businesses</h2>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/40">
                {businesses.length}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((biz) => (
                <ListingCard
                  key={biz.id}
                  variant="business"
                  item={biz as unknown as Business}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Services ── */}
        {services && services.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-xs text-emerald-400">S</span>
              <h2 className="text-lg font-semibold text-white">Services</h2>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/40">
                {services.length}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((svc) => (
                <ListingCard
                  key={svc.id}
                  variant="service"
                  item={svc as unknown as ServiceListing}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Classifieds ── */}
        {classifieds && classifieds.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-400/20 text-xs text-blue-400">C</span>
              <h2 className="text-lg font-semibold text-white">Classifieds</h2>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/40">
                {classifieds.length}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classifieds.map((cl) => (
                <ListingCard
                  key={cl.id}
                  variant="classified"
                  item={cl as unknown as Classified}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Jobs ── */}
        {jobs && jobs.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-400/20 text-xs text-purple-400">J</span>
              <h2 className="text-lg font-semibold text-white">Jobs</h2>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/40">
                {jobs.length}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <ListingCard
                  key={job.id}
                  variant="job"
                  item={job as unknown as Job}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {(!businesses || businesses.length === 0) &&
          (!services || services.length === 0) &&
          (!classifieds || classifieds.length === 0) &&
          (!jobs || jobs.length === 0) && (
            <div className="py-20 text-center">
              <Store className="mx-auto h-12 w-12 text-white/10" />
              <p className="mt-4 text-sm text-white/40">
                This user hasn&apos;t added any listings yet.
              </p>
            </div>
          )}
      </div>
    </div>
  )
}
