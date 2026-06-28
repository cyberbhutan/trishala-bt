'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  X,
  Search,
  Plus,
  User,
  LogOut,
  LayoutDashboard,
  Building2,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

/* ═══════════════════════════════════════════════════════════════════
   Nav Links
   ═══════════════════════════════════════════════════════════════════ */

interface NavLink {
  label: string
  href: string
  icon?: React.ElementType
}

const publicLinks: NavLink[] = [
  { label: 'Browse', href: '/browse' },
  { label: 'Categories', href: '/categories' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const userLinks: NavLink[] = [
  { label: 'Dashboard', href: '/business/dashboard', icon: LayoutDashboard },
  { label: 'My Listings', href: '/business/listings', icon: Building2 },
]

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  /* ── Auth state ── */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
      setLoading(false)
    }
    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener?.subscription.unsubscribe()
  }, [supabase])

  /* ── Scroll effect ── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  /* ── Close user menu on outside click ── */
  const handleClickOutside = useCallback(() => setUserMenuOpen(false), [])

  useEffect(() => {
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [userMenuOpen, handleClickOutside])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/business/dashboard') return pathname.startsWith(href)
    return pathname === href
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-gray-200/60 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <span className="text-brand-700">Trishala</span>
          <span className="text-accent-500">.bt</span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden items-center gap-1 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-navy'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Desktop actions ── */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-navy"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setUserMenuOpen((prev) => !prev)
                }}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                  userMenuOpen
                    ? 'bg-brand-700/10 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-navy'
                )}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">
                  {user.email?.split('@')[0] ?? 'Account'}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    userMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 origin-top-right animate-fade-in-down rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="truncate text-sm font-medium text-navy">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    {userLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                          isActive(link.href)
                            ? 'bg-brand-700/10 text-brand-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-navy'
                        )}
                      >
                        {link.icon && <link.icon className="h-4 w-4" />}
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          <Link href="/business/create">
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />}>
              Add Listing
            </Button>
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy transition-colors hover:bg-gray-100 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="animate-fade-in-down border-t border-gray-100 bg-white px-4 pb-6 pt-3 md:hidden">
          <div className="space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-brand-700/10 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-navy'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <hr className="my-3 border-gray-100" />

          <div className="space-y-2">
            {loading ? (
              <div className="h-10 animate-pulse rounded-xl bg-gray-200" />
            ) : user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700/10 text-brand-700">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium text-navy truncate">
                    {user.email}
                  </div>
                </div>

                {userLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-brand-700/10 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-navy'
                    )}
                  >
                    {link.icon && <link.icon className="h-4 w-4" />}
                    {link.label}
                  </Link>
                ))}

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" fullWidth>
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/register" className="w-full">
                  <Button variant="primary" fullWidth>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            <Link href="/business/create" className="block pt-2">
              <Button variant="secondary" fullWidth icon={<Plus className="h-4 w-4" />}>
                Add Listing
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
