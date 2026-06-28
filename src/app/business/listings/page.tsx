import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit3, Eye, Star, BarChart3 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function BusinessListingsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Businesses</h1>
            <p className="mt-1 text-sm text-white/50">Manage your business listings</p>
          </div>
          <Link
            href="/business/listings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF8A00] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#E67A00]"
          >
            <Plus className="h-4 w-4" /> Add Business
          </Link>
        </div>

        {(!businesses || businesses.length === 0) ? (
          <div className="mt-12 rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <p className="text-white/40">You haven't listed any businesses yet.</p>
            <Link href="/business/listings/new" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#FF8A00] hover:underline">
              <Plus className="h-4 w-4" /> List your first business
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {businesses.map((biz) => (
              <div key={biz.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#003B82]/20 to-[#0F172A] text-lg font-bold text-white">
                      {biz.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{biz.name}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          biz.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                          biz.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          biz.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                          'bg-white/10 text-white/40'
                        }`}>
                          {biz.status.charAt(0).toUpperCase() + biz.status.slice(1)}
                        </span>
                        <span className="text-[10px] text-white/30">{biz.tier}</span>
                      </div>
                      {biz.short_description && (
                        <p className="mt-1 text-sm text-white/40 line-clamp-1">{biz.short_description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-white/30">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {biz.views_count}</span>
                        {biz.avg_rating > 0 && (
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {biz.avg_rating.toFixed(1)}</span>
                        )}
                        <span>Created {formatDate(biz.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {biz.status === 'approved' && (
                      <Link
                        href={`/business/${biz.slug}`}
                        className="rounded-lg border border-white/10 p-2 text-white/40 hover:border-white/20 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    )}
                    <Link
                      href={`/business/listings/${biz.id}/edit`}
                      className="rounded-lg border border-white/10 p-2 text-white/40 hover:border-white/20 hover:text-white"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/business/analytics/${biz.id}`}
                      className="rounded-lg border border-white/10 p-2 text-white/40 hover:border-white/20 hover:text-white"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
