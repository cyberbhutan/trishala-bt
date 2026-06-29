import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail, Inbox } from 'lucide-react'
import { getMyInquiries } from '@/lib/actions/inquiries'
import InquiriesClient from './InquiriesClient'

export default async function DashboardInquiriesPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('owner_id', user.id)

  const inquiries = await getMyInquiries(user.id)

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-[#FF8A00]" />
            <h1 className="text-2xl font-bold text-white">Inquiries</h1>
            {inquiries.filter((i: any) => !i.is_read).length > 0 && (
              <span className="flex h-6 items-center rounded-full bg-[#FF8A00]/20 px-2.5 text-xs font-medium text-[#FF8A00]">
                {inquiries.filter((i: any) => !i.is_read).length} unread
              </span>
            )}
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/50 transition-all hover:border-white/10 hover:text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* No businesses state */}
        {(!businesses || businesses.length === 0) ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <Inbox className="mx-auto h-10 w-10 text-white/20" />
            <p className="mt-4 text-white/50">No businesses yet</p>
            <p className="mt-1 text-sm text-white/30">You need to create a business before you can receive inquiries</p>
            <Link
              href="/business/listings/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#E67A00] transition-all"
            >
              Create a Business →
            </Link>
          </div>
        ) : inquiries.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <Mail className="mx-auto h-10 w-10 text-white/20" />
            <p className="mt-4 text-white/50">No inquiries yet</p>
            <p className="mt-1 text-sm text-white/30">When customers send inquiries to your businesses, they will appear here</p>
          </div>
        ) : (
          <InquiriesClient inquiries={inquiries} />
        )}
      </div>
    </div>
  )
}
