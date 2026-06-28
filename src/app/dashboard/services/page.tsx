import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wrench, Plus, Edit, Star } from 'lucide-react'

export default async function DashboardServicesPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: items } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="h-6 w-6 text-[#34c759]" />
            <h1 className="text-2xl font-bold text-white">My Services</h1>
          </div>
          <Link href="/services?create=true" className="flex items-center gap-1.5 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#E67A00]">
            <Plus className="h-4 w-4" /> Add Service
          </Link>
        </div>

        {(!items || items.length === 0) ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <Wrench className="mx-auto h-10 w-10 text-white/20" />
            <p className="mt-4 text-white/50">No services listed yet</p>
            <Link href="/services?create=true" className="mt-3 inline-block text-sm font-medium text-[#FF8A00] hover:text-[#E67A00]">
              List your first service →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-3 font-medium text-white/50">Service</th>
                  <th className="px-4 py-3 font-medium text-white/50">Price</th>
                  <th className="px-4 py-3 font-medium text-white/50">Rating</th>
                  <th className="px-4 py-3 font-medium text-white/50">Status</th>
                  <th className="px-4 py-3 font-medium text-white/50">Views</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {items?.map((item: any) => (
                  <tr key={item.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{item.title}</p>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {item.price ? `Nu. ${Number(item.price)}${item.price_type === 'hourly' ? '/hr' : ''}` : item.price_type === 'free' ? 'Free' : 'Quote'}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-1 text-white/50">
                      <Star className="h-3 w-3 fill-[#FF8A00] text-[#FF8A00]" />
                      {Number(item.avg_rating).toFixed(1)} ({item.review_count || 0})
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        item.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                        item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{item.views_count || 0}</td>
                    <td className="px-4 py-3">
                      <Link href={`/services/${item.id}`} className="text-white/30 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
