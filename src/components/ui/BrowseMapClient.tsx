'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import type { Business } from '@/lib/types'

const ListingMap = dynamic(
  () => import('@/components/ui/ListingMap').then((m) => m.ListingMap),
  { ssr: false },
)

interface BrowseMapClientProps {
  businesses: any[]
}

export default function BrowseMapClient({ businesses }: BrowseMapClientProps) {
  const mapItems = businesses.filter(
    (b: any) => b.latitude != null && b.longitude != null,
  )

  if (mapItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <MapPin className="h-7 w-7 text-white/30" />
        </div>
        <p className="text-lg font-medium text-white/60">No businesses with map locations</p>
        <p className="mt-1 text-sm text-white/40">
          The filtered businesses don&apos;t have coordinates yet
        </p>
      </div>
    )
  }

  const avgLat =
    mapItems.reduce((sum: number, b: any) => sum + Number(b.latitude), 0) /
    mapItems.length
  const avgLng =
    mapItems.reduce((sum: number, b: any) => sum + Number(b.longitude), 0) /
    mapItems.length

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-white/10">
      <ListingMap
        listings={mapItems}
        center={[avgLat, avgLng]}
        zoom={10}
      />
    </div>
  )
}
