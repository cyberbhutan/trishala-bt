'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MapPin, Star, AlertCircle } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface ListingMapItem {
  id: number
  name: string
  latitude: number
  longitude: number
  slug: string
  city: string | null
  cover_image: string | null
  avg_rating: number | null
}

interface ListingMapProps {
  listings: ListingMapItem[]
  center: [number, number]
  zoom?: number
}

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function ListingMap({
  listings,
  center,
  zoom = 12,
}: ListingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [loadError, setLoadError] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    let L: any

    async function initMap() {
      try {
        // Dynamic import to avoid SSR issues
        const leafletModule = await import('leaflet')
        L = leafletModule.default || leafletModule

        // Wait for the DOM element to be ready
        if (!mapContainerRef.current) return

        // Fix default marker icon issue with bundlers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        // Clean up previous instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        // Create map
        const map = L.map(mapContainerRef.current, {
          center: center as [number, number],
          zoom,
          zoomControl: true,
          scrollWheelZoom: true,
        })

        // Dark tile layer
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
          }
        ).addTo(map)

        mapInstanceRef.current = map
        setLeafletLoaded(true)

        // Create custom marker icon (orange circle with number)
        // We need to wait for markers with numbers after we add them
      } catch (err) {
        console.error('Failed to load Leaflet:', err)
        setLoadError(true)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  // Update markers when listings change
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !leafletLoaded) return

      const L = await import('leaflet')
      const map = mapInstanceRef.current

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add new markers
      listings.forEach((listing, idx) => {
        if (!listing.latitude || !listing.longitude) return

        // Create custom orange circle icon with number
        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF8A00, #FF6B00);
            color: white;
            font-size: 12px;
            font-weight: 700;
            font-family: system-ui, -apple-system, sans-serif;
            box-shadow: 0 2px 8px rgba(255, 138, 0, 0.4);
            border: 2px solid rgba(255, 255, 255, 0.8);
            cursor: pointer;
          ">${idx + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -20],
        })

        const marker = L.marker(
          [listing.latitude, listing.longitude],
          { icon: customIcon }
        ).addTo(map)

        // Popup content
        const rating =
          listing.avg_rating != null && listing.avg_rating > 0
            ? `${Number(listing.avg_rating).toFixed(1)}`
            : null

        const popupContent = `
          <div style="
            min-width: 200px;
            background: #0F172A;
            border-radius: 12px;
            overflow: hidden;
            font-family: system-ui, -apple-system, sans-serif;
          ">
            ${
              listing.cover_image
                ? `<div style="
                    width: 100%;
                    height: 100px;
                    background-image: url('${listing.cover_image}');
                    background-size: cover;
                    background-position: center;
                  "></div>`
                : ''
            }
            <div style="padding: 12px;">
              <div style="
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 4px;
              ">${listing.name}</div>
              ${
                listing.city
                  ? `<div style="
                      font-size: 12px;
                      color: rgba(255,255,255,0.5);
                      margin-bottom: 6px;
                    ">📍 ${listing.city}</div>`
                  : ''
              }
              ${
                rating
                  ? `<div style="
                      font-size: 12px;
                      color: #fbbf24;
                      margin-bottom: 8px;
                    ">⭐ ${rating}</div>`
                  : ''
              }
              <a href="/business/${listing.slug}" style="
                display: inline-block;
                padding: 6px 14px;
                background: #FF8A00;
                color: white;
                font-size: 12px;
                font-weight: 600;
                border-radius: 8px;
                text-decoration: none;
              ">View Details</a>
            </div>
          </div>
        `

        marker.bindPopup(popupContent, {
          maxWidth: 240,
          className: 'listing-map-popup',
          closeButton: true,
        })

        markersRef.current.push(marker)
      })

      // Fit bounds if we have markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current)
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }

    updateMarkers()
  }, [listings, leafletLoaded])

  /* ── Fallback on error ── */
  if (loadError) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-white/30" />
          <p className="mt-2 text-sm text-white/40">
            Map could not be loaded. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full animate-fade-in">
      <div
        ref={mapContainerRef}
        className="h-[400px] w-full rounded-2xl border border-white/10 overflow-hidden"
      />
      {/* Fallback while loading */}
      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#0F172A]/80">
          <div className="text-center">
            <MapPin className="mx-auto h-8 w-8 text-white/20" />
            <p className="mt-2 text-sm text-white/40">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
