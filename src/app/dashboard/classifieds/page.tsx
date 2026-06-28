import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react'

export default async function DashboardClassifiedsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: items } = await supabase
    .from('classifieds')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-[#2997ff]" />
            <h1 className="text-2xl font-bold text-white">My Classifieds</h1>
          </div>
          <Link href="/classifieds/new" className="flex items-center gap-1.5 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#E67A00]">
            <Plus className="h-4 w-4" /> Post New
          </Link>
        </div>

        {(!items || items.length === 0) ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <MapPin className="mx-auto h-10 w-10 text-white/20" />
            <p className="mt-4 text-white/50">No classifieds posted yet</p>
            <Link href="/classifieds/new" className="mt-3 inline-block text-sm font-medium text-[#FF8A00] hover:text-[#E67A00]">
              Post your first classified →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-4 py-3 font-medium text-white/50">Title</th>
                  <th className="px-4 py-3 font-medium text-white/50">Price</th>
                  <th className="px-4 py-3 font-medium text-white/50">Status</th>
                  <th className="px-4 py-3 font-medium text-white/50">Views</th>
                  <th className="px-4 py-3 font-medium text-white/50">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{item.title}</p>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {item.price ? `Nu. ${Number(item.price).toLocaleString()}` : item.price_type === 'free' ? 'Free' : 'Negotiable'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        item.status === 'active' ? 'bg-green-500/10 text-green-400' :
                        item.status === 'sold' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{item.views_count || 0}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Link href={`/classifieds/${item.id}`} className="text-white/30 hover:text-white">
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
