import Link from 'next/link'
import { MapPin, Wrench, Briefcase, Store, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0f1a] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF8A00] to-[#FFB347] text-xs font-bold text-white">
                T
              </div>
              <span className="text-sm font-bold text-white">Trishala</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/40">
              Bhutan&apos;s all-in-one platform. Find businesses, buy and sell, hire services, and discover jobs across the country.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Explore</h4>
            <div className="space-y-2.5">
              <Link href="/browse" className="flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white">
                <Store className="h-3 w-3" /> Business Directory
              </Link>
              <Link href="/classifieds" className="flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white">
                <MapPin className="h-3 w-3" /> Classifieds
              </Link>
              <Link href="/services" className="flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white">
                <Wrench className="h-3 w-3" /> Services
              </Link>
              <Link href="/jobs" className="flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white">
                <Briefcase className="h-3 w-3" /> Jobs
              </Link>
            </div>
          </div>

          {/* For Users */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">For You</h4>
            <div className="space-y-2.5">
              <Link href="/auth/login" className="block text-xs text-white/40 transition-colors hover:text-white">Sign In</Link>
              <Link href="/auth/register" className="block text-xs text-white/40 transition-colors hover:text-white">Create Account</Link>
              <Link href="/dashboard" className="block text-xs text-white/40 transition-colors hover:text-white">My Dashboard</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Contact</h4>
            <div className="space-y-2.5">
              <a href="mailto:infocyberbhutan@gmail.com" className="flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-white">
                <Mail className="h-3 w-3" /> infocyberbhutan@gmail.com
              </a>
              <p className="text-xs text-white/30">Made with ❤️ in Bhutan</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-white/30">© 2026 Trishala. All rights reserved. Powered by Cyber Bhutan.</p>
        </div>
      </div>
    </footer>
  )
}
