import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Trishala — Business Directory of Bhutan',
  description: 'Find and connect with the best businesses across Bhutan. Restaurants, shops, services, and more.',
  keywords: 'Bhutan business directory, Thimphu businesses, Bhutan services, Trishala',
  openGraph: {
    title: 'Trishala — Business Directory of Bhutan',
    description: 'Find and connect with the best businesses across Bhutan.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0F172A] font-sans antialiased">
        {/* Simple Debug Top Bar */}
        <div className="flex items-center justify-between border-b border-white/5 bg-[#0a0f1a] px-4 py-2">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">Trishala</span>
              <span className="text-[10px] text-white/30">.bt</span>
            </a>
            <a href="/browse" className="text-xs text-white/40 hover:text-white/60">Browse</a>
            <a href="/business/listings" className="text-xs text-white/40 hover:text-white/60">List</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/auth/login" className="text-xs text-white/40 hover:text-white/60">Login</a>
            <a
              href="/auth/register"
              className="rounded-lg bg-[#FF8A00] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#E67A00]"
            >
              Sign Up
            </a>
          </div>
        </div>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
