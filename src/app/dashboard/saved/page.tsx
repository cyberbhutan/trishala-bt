import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import { ListingCard } from '@/components/ui/ListingCard'
import { getUserFavorites } from '@/lib/actions/favorites'
import type { Business, Classified, ServiceListing, Job } from '@/lib/types'

type ListingVariant = 'business' | 'classified' | 'service' | 'job'
type ListingItem = Business | Classified | ServiceListing | Job

interface ResolvedFavorite {
  variant: ListingVariant
  item: ListingItem
}

export default async function SavedListingsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const favorites = await getUserFavorites(user.id)

  // Group favorites by item_type so we can batch-fetch each type
  const grouped = new Map<string, number[]>()
  for (const fav of favorites) {
    const ids = grouped.get(fav.item_type) || []
    ids.push(fav.item_id)
    grouped.set(fav.item_type, ids)
  }

  // Fetch actual listing data for each type
  const resolved: ResolvedFavorite[] = []

  if (grouped.has('business')) {
    const ids = grouped.get('business')!
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .in('id', ids)
    if (data) {
      for (const item of data as unknown as Business[]) {
        resolved.push({ variant: 'business', item: item as unknown as ListingItem })
      }
    }
  }

  if (grouped.has('classified')) {
    const ids = grouped.get('classified')!
    const { data } = await supabase
      .from('classifieds')
      .select('*')
      .in('id', ids)
    if (data) {
      for (const item of data as unknown as Classified[]) {
        resolved.push({ variant: 'classified', item: item as unknown as ListingItem })
      }
    }
  }

  if (grouped.has('service')) {
    const ids = grouped.get('service')!
    const { data } = await supabase
      .from('services')
      .select('*')
      .in('id', ids)
    if (data) {
      for (const item of data as unknown as ServiceListing[]) {
        resolved.push({ variant: 'service', item: item as unknown as ListingItem })
      }
    }
  }

  if (grouped.has('job')) {
    const ids = grouped.get('job')!
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .in('id', ids)
    if (data) {
      for (const item of data as unknown as Job[]) {
        resolved.push({ variant: 'job', item: item as unknown as ListingItem })
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Saved Listings</h1>
          <p className="mt-1 text-sm text-white/50">
            {resolved.length > 0
              ? `You have ${resolved.length} saved ${resolved.length === 1 ? 'listing' : 'listings'}`
              : 'Items you save will appear here'}
          </p>
        </div>

        {/* Content */}
        {resolved.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Heart className="h-8 w-8 text-white/20" />
            </div>
            <h2 className="text-lg font-semibold text-white">No saved listings yet</h2>
            <p className="mt-1 max-w-sm text-sm text-white/40">
              Start exploring and tap the heart icon to save your favourite businesses,
              classifieds, services, and jobs.
            </p>
            <Link
              href="/browse"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[#FF8A00] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#E67A00]"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resolved.map(({ variant, item }) => (
              <ListingCard
                key={`${variant}-${(item as any).id}`}
                variant={variant}
                item={item}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
