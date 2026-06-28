import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { approveBusiness, rejectBusiness } from '@/lib/actions/businesses'
import { formatDate } from '@/lib/utils'
import { Check, X } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  // Fetch pending businesses
  const { data: pending } = await supabase
    .from('businesses')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch all approved
  const { data: approved } = await supabase
    .from('businesses')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="mt-1 text-sm text-white/50">Manage business listings</p>

        {/* Pending */}
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Pending Review {pending && pending.length > 0 && <span className="text-[#FF8A00]">({pending.length})</span>}
          </h2>
          {(!pending || pending.length === 0) ? (
            <p className="text-sm text-white/40">No pending listings.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((biz) => (
                <div key={biz.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{biz.name}</h3>
                      <p className="mt-1 text-sm text-white/50 line-clamp-2">{biz.short_description || biz.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-white/30">
                        <span>{biz.city}</span>
                        <span>{biz.phone}</span>
                        <span>Listed {formatDate(biz.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={approveBusiness.bind(null, biz.id)}>
                        <button className="rounded-lg border border-green-500/20 p-2 text-green-400 hover:bg-green-500/10">
                          <Check className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={rejectBusiness.bind(null, biz.id)}>
                        <button className="rounded-lg border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10">
                          <X className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Approved */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-white">Approved Listings ({approved?.length || 0})</h2>
          <div className="space-y-2">
            {approved?.map((biz) => (
              <div key={biz.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">{biz.name}</span>
                  <span className="text-xs text-white/30">{biz.city}</span>
                  <span className="text-xs text-white/20">{biz.views_count} views</span>
                </div>
                <span className="text-xs text-green-400/60">{formatDate(biz.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
