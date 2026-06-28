import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { approveBusiness, rejectBusiness } from '@/lib/actions/businesses'
import { formatDate } from '@/lib/utils'
import { Check, X, Store, MapPin, Wrench, Briefcase } from 'lucide-react'
import Link from 'next/link'

async function PendingSection({ data, label, color, icon: Icon, type }: any) {
  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <Icon className="h-5 w-5" style={{ color }} />
        Pending {label}
        {data && data.length > 0 && <span className="text-sm font-normal" style={{ color }}>({data.length})</span>}
      </h2>
      {(!data || data.length === 0) ? (
        <p className="text-sm text-white/40">No pending {label.toLowerCase()}.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item: any) => (
            <div key={item.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.name || item.title}</h3>
                  <p className="mt-1 text-sm text-white/50 line-clamp-2">{item.short_description || item.description || item.title}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-white/30">
                    {item.city && <span>{item.city}</span>}
                    {item.phone && <span>{item.phone}</span>}
                    <span>Listed {formatDate(item.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={type === 'business' ? approveBusiness.bind(null, item.id) : undefined}>
                    <button className="rounded-lg border border-green-500/20 p-2 text-green-400 hover:bg-green-500/10">
                      <Check className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={type === 'business' ? rejectBusiness.bind(null, item.id) : undefined}>
                    <button className="rounded-lg border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10">
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                  <Link href={`/${type === 'business' ? 'business' : type === 'classified' ? 'classifieds' : type === 'service' ? 'services' : 'jobs'}/${item.slug || item.id}`} className="rounded-lg border border-white/10 p-2 text-white/40 hover:text-white">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default async function AdminPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')

  const [pendingBiz, pendingClassifieds, pendingServices, approvedBiz, allClassifieds, allServices, allJobs, allUsers] = await Promise.all([
    supabase.from('businesses').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('classifieds').select('*, categories:classified_categories(name)').eq('status', 'active').order('created_at', { ascending: false }).limit(10),
    supabase.from('services').select('*, categories:service_categories(name)').eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('businesses').select('id, name, city, views_count, created_at').eq('status', 'approved').order('created_at', { ascending: false }).limit(20),
    supabase.from('classifieds').select('id, title, price, status, views_count, city, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('services').select('id, title, price, status, views_count, avg_rating, city, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('jobs').select('id, title, company_name, status, views_count, application_count, city, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('*').limit(10),
  ])

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="mt-1 text-sm text-white/50">Manage all Trishala listings</p>

        {/* Stats Bar */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          {[
            { label: 'Businesses', count: approvedBiz.data?.length || 0, icon: Store, color: '#FF8A00' },
            { label: 'Classifieds', count: allClassifieds.data?.length || 0, icon: MapPin, color: '#2997ff' },
            { label: 'Services', count: allServices.data?.length || 0, icon: Wrench, color: '#34c759' },
            { label: 'Jobs', count: allJobs.data?.length || 0, icon: Briefcase, color: '#af52de' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                <span className="text-xs text-white/50">{stat.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-white">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Pending sections */}
        <PendingSection data={pendingBiz.data} label="Businesses" color="#FF8A00" icon={Store} type="business" />
        <PendingSection data={pendingServices.data} label="Services" color="#34c759" icon={Wrench} type="service" />

        {/* Recent All */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Classifieds</h2>
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-4 py-3 font-medium text-white/50">Title</th>
                <th className="px-4 py-3 font-medium text-white/50">Price</th>
                <th className="px-4 py-3 font-medium text-white/50">Status</th>
                <th className="px-4 py-3 font-medium text-white/50">Views</th>
                <th className="px-4 py-3 font-medium text-white/50">Date</th>
              </tr></thead>
              <tbody>
                {allClassifieds.data?.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">{item.title}</td>
                    <td className="px-4 py-3 text-white/70">{item.price ? `Nu. ${Number(item.price).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] text-green-400">{item.status}</span></td>
                    <td className="px-4 py-3 text-white/50">{item.views_count}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Jobs</h2>
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-4 py-3 font-medium text-white/50">Title</th>
                <th className="px-4 py-3 font-medium text-white/50">Company</th>
                <th className="px-4 py-3 font-medium text-white/50">Applications</th>
                <th className="px-4 py-3 font-medium text-white/50">Status</th>
                <th className="px-4 py-3 font-medium text-white/50">Date</th>
              </tr></thead>
              <tbody>
                {allJobs.data?.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">{item.title}</td>
                    <td className="px-4 py-3 text-white/70">{item.company_name}</td>
                    <td className="px-4 py-3 text-white/50">{item.application_count || 0}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[11px] text-green-400">{item.status}</span></td>
                    <td className="px-4 py-3 text-white/40 text-xs">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
