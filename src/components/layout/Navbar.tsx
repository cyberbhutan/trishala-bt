'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Store, MapPin, Wrench, Briefcase, User, Plus, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/browse', label: 'Browse', icon: Store },
  { href: '/classifieds', label: 'Classifieds', icon: MapPin },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full border-b transition-all duration-300',
        scrolled
          ? 'border-white/10 bg-[#0a0f1a]/90 backdrop-blur-xl shadow-lg shadow-black/10'
          : 'border-white/5 bg-[#0a0f1a]/80 backdrop-blur-xl',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8A00] to-[#FFB347] text-sm font-bold text-white shadow-lg shadow-[#FF8A00]/20 transition-transform duration-300 group-hover:scale-105">
            T
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold tracking-tight text-white">Trishala</span>
            <span className="text-[11px] font-medium text-white/30">.bt</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white"
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Post Listing — desktop only */}
          <Link
            href="/post-listing"
            className="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95 md:flex"
            style={{ backgroundColor: '#FF8A00' }}
          >
            <Plus className="h-4 w-4" />
            Post Listing
          </Link>

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/60 transition-all hover:border-[#FF8A00]/30 hover:bg-[#FF8A00]/5 hover:text-white"
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Sign In */}
          <Link
            href="/auth/login"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white/40 transition-all hover:text-white sm:flex"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/50 transition-all hover:bg-white/5 hover:text-white md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Panel */}
      <div
        className={cn(
          'overflow-hidden border-t border-white/5 bg-[#0a0f1a] transition-all duration-300 ease-in-out md:hidden',
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="space-y-1 px-4 pb-6 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}

          <hr className="my-3 border-white/5" />

          {/* Post Listing — mobile */}
          <Link
            href="/post-listing"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]"
            style={{ backgroundColor: '#FF8A00' }}
          >
            <Plus className="h-4 w-4" />
            Post Listing
          </Link>

          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white"
          >
            <User className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/auth/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      </div>
    </header>
  )
}
