'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════ */

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'business', label: 'Businesses' },
  { value: 'classified', label: 'Classifieds' },
  { value: 'service', label: 'Services' },
  { value: 'job', label: 'Jobs' },
]

const POPULAR_TAGS = ['Restaurants', 'Hotels', 'Shopping', 'Services']

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

interface HeroSearchProps {
  className?: string
}

export function HeroSearch({ className }: HeroSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (category) params.set('type', category)
    router.push(`/browse?${params.toString()}`)
  }

  function handleTagClick(tag: string) {
    router.push(`/browse?q=${encodeURIComponent(tag)}`)
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#003B82] to-[#0F172A]',
        className
      )}
    >
      {/* ── Dot pattern overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Gradient fade at bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F172A] to-transparent" />

      {/* ── Content ── */}
      <div className="relative mx-auto max-w-4xl px-4 pb-28 pt-20 sm:px-6 lg:px-8 lg:pb-36 lg:pt-28">
        <div className="text-center">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-accent-500" />
            Bhutan&apos;s All-in-One Platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Discover{' '}
            <span className="bg-gradient-to-r from-accent-500 to-[#FFB347] bg-clip-text text-transparent">
              Bhutan
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
            Find businesses, buy and sell, hire services, and discover job
            opportunities — from Thimphu to Trashigang.
          </p>

          {/* ── Search Bar ── */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anything in Bhutan..."
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/30 sm:rounded-r-none"
                />
              </div>

              {/* Category select */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none rounded-xl border border-white/10 bg-white/10 px-4 py-3.5 text-sm text-white/70 backdrop-blur-sm transition-all focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/30 sm:rounded-l-none sm:rounded-r-none sm:border-l-0 sm:border-r-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#0F172A] text-white">
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Search button */}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-600 active:scale-[0.97] sm:rounded-l-none"
              >
                <Search className="h-4 w-4" />
                <span className="sm:hidden">Search</span>
              </button>
            </div>
          </form>

          {/* ── Popular Tags ── */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-white/30">Popular:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur-sm transition-all hover:border-accent-500/30 hover:bg-accent-500/10 hover:text-white"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
