import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Store, MapPin, Wrench, Briefcase, Plus, Eye, Star, Settings, Heart, TrendingUp, ArrowUpRight, BarChart3 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [businesses, classifieds, services, jobs, profile, favoritesCount] = await Promise.all([
    supabase.from('businesses').select('id, name, slug, status, views_count, avg_rating, review_count').eq('owner_id', user.id).order('created_at', { ascending: false }),
    supabase.from('classifieds').select('id, title, slug, price, status, views_count').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('services').select('id, title, slug, status, views_count, avg_rating').eq('provider_id', user.id).order('created_at', { ascending: false }),
    supabase.from('jobs').select('id, title, slug, status, views_count, application_count').eq('employer_id', user.id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    // @ts-expect-error - favorites table not in types yet
    supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const sections = [
    { label: 'Businesses', icon: Store, href: '/browse', newHref: '/business/listings/new', count: businesses.data?.length || 0, data: businesses.data || [], color: '#FF8A00', listHref: '/browse' },
    { label: 'Classifieds', icon: MapPin, href: '/dashboard/classifieds', newHref: '/classifieds/new', count: classifieds.data?.length || 0, data: classifieds.data || [], color: '#2997ff', listHref: '/dashboard/classifieds' },
    { label: 'Services', icon: Wrench, href: '/dashboard/services', newHref: '/services?create=true', count: services.data?.length || 0, data: services.data || [], color: '#34c759', listHref: '/dashboard/services' },
    { label: 'Jobs', icon: Briefcase, href: '/dashboard/jobs', newHref: '/jobs/new', count: jobs.data?.length || 0, data: jobs.data || [], color: '#af52de', listHref: '/dashboard/jobs' },
  ]

  const totalViews = [...(businesses.data || []), ...(classifieds.data || []), ...(services.data || []), ...(jobs.data || [])]
    .reduce((sum, item) => sum + (item.views_count || 0), 0)

  const allListings = [...(businesses.data || []), ...(classifieds.data || []), ...(services.data || []), ...(jobs.data || [])]
  const pendingCount = allListings.filter(item => item.status === 'pending').length
  const activeCount = allListings.filter(item => item.status === 'active' || item.status === 'approved').length

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="mt-1 text-sm text-white/50">
                Welcome back{profile.data?.full_name ? `, ${profile.data.full_name}` : ''}
              </p>
            </div>
            <Link
              href="/dashboard/saved"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/60 transition-all hover:border-red-400/20 hover:bg-red-500/5 hover:text-red-400"
            >
              <Heart className="h-4 w-4" />
              Saved
              {favoritesCount.count && favoritesCount.count > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-medium text-red-400">
                  {favoritesCount.count}
                </span>
              )}
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-2xl font-bold text-white">{allListings.length}</p>
              <p className="text-xs text-white/40">Total Listings</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-2xl font-bold text-green-400">{activeCount}</p>
              <p className="text-xs text-white/40">Active</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
              <p className="text-xs text-white/40">Pending</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-white/40">Total Views</p>
            </div>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: '/dashboard/saved', icon: Heart, label: 'Saved', desc: 'View saved listings', color: '#ef4444' },
            { href: '/admin', icon: Settings, label: 'Admin', desc: 'Manage platform', color: '#8b5cf6' },
            { href: '/browse', icon: Store, label: 'Browse', desc: 'Explore directory', color: '#FF8A00' },
            { href: '/dashboard', icon: BarChart3, label: 'Analytics', desc: 'View stats', color: '#2997ff' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-[#FF8A00] transition-colors">{item.label}</p>
                <p className="text-[11px] text-white/40">{item.desc}</p>
              </div>
            </Link>
          ))}
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
                    <Link href={section.newHref} className="flex items-center gap-1 rounded-xl bg-[#FF8A00] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#E67A00] transition-all">
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
                      <ArrowUpRight className="h-4 w-4 text-white/20" />
                    </Link>
                  ))}
                  {section.data.length > 5 && (
                    <Link href={section.listHref} className="block text-center text-xs text-white/40 hover:text-white/60 py-2">
                      View all {section.data.length} →
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Admin link */}
        <div className="mt-10 flex gap-3">
          <Link href="/admin" className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white/50 transition-all hover:text-white flex-1">
            <Settings className="h-4 w-4" />
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  )
}
