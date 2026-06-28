'use client'

import Link from 'next/link'
import {
  Globe,
  Camera,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ═══════════════════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════════════════ */

interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

const columns: FooterColumn[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse Businesses', href: '/browse' },
      { label: 'Categories', href: '/categories' },
      { label: 'Featured Listings', href: '/browse?featured=true' },
      { label: 'Popular in Thimphu', href: '/browse?city=Thimphu' },
    ],
  },
  {
    title: 'For Business Owners',
    links: [
      { label: 'Add Your Business', href: '/business/create' },
      { label: 'Pricing & Plans', href: '/pricing' },
      { label: 'Business Dashboard', href: '/business/dashboard' },
      { label: 'Success Stories', href: '/stories' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

const socialLinks = [
  { label: 'Facebook', href: '#', icon: Globe },
  { label: 'Instagram', href: '#', icon: Camera },
  { label: 'Email', href: 'mailto:hello@trishala.bt', icon: Mail },
]

const contactInfo = [
  {
    label: 'Thimphu, Bhutan',
    href: '#',
    icon: MapPin,
  },
  {
    label: '+975-2-XXX XXX',
    href: 'tel:+9752XXXXXX',
    icon: Phone,
  },
  {
    label: 'hello@trishala.bt',
    href: 'mailto:hello@trishala.bt',
    icon: Mail,
  },
]

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white">
      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* ── Brand column ── */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight"
            >
              <span className="text-white">Trishala</span>
              <span className="text-accent-500">.bt</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
              Bhutan&apos;s premier business directory. Discover and connect with the
              best local businesses across the kingdom — from cozy cafés in Thimphu to
              luxury resorts in Paro.
            </p>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-gray-400 transition-all hover:bg-white/20 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Contact details */}
            <div className="mt-6 space-y-2.5">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 text-sm text-gray-400 transition-colors hover:text-white"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ── Link columns ── */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold tracking-wider uppercase text-gray-300">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} Trishala.bt. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-gray-500">
            Made with <Heart className="h-3 w-3 text-red-400" /> in Bhutan
          </p>
        </div>
      </div>
    </footer>
  )
}
