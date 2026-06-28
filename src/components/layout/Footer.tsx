import Link from 'next/link'
import { Store, MapPin, Wrench, Briefcase, User, LogIn, UserPlus, Mail, Phone, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const quickLinks = [
  { href: '/browse', label: 'Browse', icon: Store },
  { href: '/classifieds', label: 'Classifieds', icon: MapPin },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
]

const userLinks = [
  { href: '/auth/login', label: 'Sign In', icon: LogIn },
  { href: '/auth/register', label: 'Create Account', icon: UserPlus },
  { href: '/dashboard', label: 'Dashboard', icon: User },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0f1a]">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8A00] to-[#FFB347] text-sm font-bold text-white shadow-lg shadow-[#FF8A00]/20 transition-transform duration-300 group-hover:scale-105">
                T
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold tracking-tight text-white">Trishala</span>
                <span className="text-[11px] font-medium text-white/30">.bt</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/40">
              Bhutan&apos;s premier local directory. Discover businesses, find services, browse
              classifieds, and explore job opportunities — all in one place, built for the
              Bhutanese community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2.5 text-sm text-white/40 transition-all hover:text-white"
                  >
                    <link.icon className="h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-[#FF8A00]" />
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              For Users
            </h4>
            <ul className="space-y-3">
              {userLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2.5 text-sm text-white/40 transition-all hover:text-white"
                  >
                    <link.icon className="h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-[#FF8A00]" />
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support / Contact */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:infocyberbhutan@gmail.com"
                  className="group flex items-center gap-2.5 text-sm text-white/40 transition-all hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-[#FF8A00]" />
                  infocyberbhutan@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+97517123456"
                  className="group flex items-center gap-2.5 text-sm text-white/40 transition-all hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-[#FF8A00]" />
                  +975 17 123 456
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Trishala. All rights reserved. Powered by Cyber Bhutan.
          </p>
          <p className="text-xs text-white/20 transition-colors hover:text-white/40">
            Made with <span className="text-red-400">&#x2764;</span> in Bhutan
          </p>
        </div>
      </div>
    </footer>
  )
}
