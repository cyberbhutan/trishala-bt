import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Store, MapPin, Wrench, Briefcase, Plus, Eye, Star, Settings } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [businesses, classifieds, services, jobs, profile] = await Promise.all([
    supabase.from('businesses').select('id, name, slug, status, views_count, avg_rating, review_count').eq('owner_id', user.id).order('created_at', { ascending: false }),
    supabase.from('classifieds').select('id, title, slug, price, status, views_count').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('services').select('id, title, slug, status, views_count, avg_rating').eq('provider_id', user.id).order('created_at', { ascending: false }),
    supabase.from('jobs').select('id, title, slug, status, views_count, application_count').eq('employer_id', user.id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  const sections = [
    { label: 'Businesses', icon: Store, href: '/browse', newHref: '/business/listings/new', count: businesses.data?.length || 0, data: businesses.data || [], color: '#FF8A00' },
    { label: 'Classifieds', icon: MapPin, href: '/dashboard/classifieds', newHref: '/classifieds/new', count: classifieds.data?.length || 0, data: classifieds.data || [], color: '#2997ff' },
    { label: 'Services', icon: Wrench, href: '/dashboard/services', newHref: '/services?create=true', count: services.data?.length || 0, data: services.data || [], color: '#34c759' },
    { label: 'Jobs', icon: Briefcase, href: '/dashboard/jobs', newHref: '/jobs/new', count: jobs.data?.length || 0, data: jobs.data || [], color: '#af52de' },
  ]

  const totalViews = [...(businesses.data || []), ...(classifieds.data || []), ...(services.data || []), ...(jobs.data || [])]
    .reduce((sum, item) => sum + (item.views_count || 0), 0)

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/50">Welcome back{profile.data?.full_name ? `, ${profile.data.full_name}` : ''}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
              <p className="text-2xl font-bold text-white">{sections.reduce((s, sec) => s + sec.count, 0)}</p>
              <p className="text-xs text-white/40">Total Listings</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
              <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-white/40">Total Views</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" style={{ color: section.color }} />
                  <h2 className="text-lg font-semibold text-white">{section.label}</h2>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/50">{section.count}</span>
                </div>
                <div className="flex gap-2">
                  {section.newHref && (
                    <Link href={section.newHref} className="flex items-center gap-1 rounded-xl bg-[#FF8A00] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#E67A00]">
                      <Plus className="h-3 w-3" /> Add New
                    </Link>
                  )}
                </div>
              </div>
              {section.data.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                  <section.icon className="mx-auto h-8 w-8" style={{ color: section.color }} />
                  <p className="mt-3 text-sm text-white/40">No {section.label.toLowerCase()} yet</p>
                  <Link href={section.newHref} className="mt-2 inline-block text-xs font-medium text-[#FF8A00] hover:text-[#E67A00]">
                    Create your first →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {section.data.slice(0, 5).map((item: any) => (
                    <Link
                      key={item.id}
                      href={section.href === '/browse' ? `/business/${item.slug}` : `${section.href}/${item.id}`}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-all hover:border-white/10"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{item.name || item.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-white/40">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            item.status === 'active' || item.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                            item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>{item.status}</span>
                          <span>{item.views_count || 0} views</span>
                          {item.avg_rating > 0 && <span>{Number(item.avg_rating).toFixed(1)} ★</span>}
                          {item.application_count > 0 && <span>{item.application_count} applications</span>}
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-white/20" />
                    </Link>
                  ))}
                  {section.data.length > 5 && (
                    <Link href={section.href} className="block text-center text-xs text-white/40 hover:text-white/60">
                      View all {section.data.length} →
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Admin link */}
        <div className="mt-10">
          <Link href="/admin" className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white/50 transition-all hover:text-white">
            <Settings className="h-4 w-4" />
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  )
}
