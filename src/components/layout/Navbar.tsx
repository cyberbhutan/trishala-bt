'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, MapPin, Store, Wrench, Briefcase, User, ChevronDown, Search } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)

  const sections = [
    { href: '/browse', label: 'Business Directory', icon: Store },
    { href: '/classifieds', label: 'Classifieds', icon: MapPin },
    { href: '/services', label: 'Services', icon: Wrench },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0f1a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF8A00] to-[#FFB347] text-xs font-bold text-white">
            T
          </div>
          <div>
            <span className="text-sm font-bold text-white">Trishala</span>
            <span className="ml-1 text-[10px] text-white/30">.bt</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white"
            >
              <section.icon className="h-3.5 w-3.5" />
              {section.label}
            </Link>
          ))}
        </div>

        {/* Auth / Dashboard */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-white/70 transition-all hover:border-[#FF8A00]/30 hover:text-white"
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/60 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-white/5 bg-[#0a0f1a] px-4 pb-4 md:hidden">
          <div className="mt-3 space-y-1">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white"
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </Link>
            ))}
            <hr className="my-2 border-white/5" />
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white"
            >
              <User className="h-4 w-4" />
              My Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
