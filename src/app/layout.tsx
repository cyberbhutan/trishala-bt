import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Trishala — Bhutan\'s All-in-One Platform',
  description: 'Find businesses, buy and sell, hire services, and discover jobs across Bhutan. The only platform you need from Thimphu to Trashigang.',
  keywords: 'Bhutan, business directory, classifieds, jobs, services, Thimphu, Trishala, marketplace',
  openGraph: {
    title: 'Trishala — Bhutan\'s All-in-One Platform',
    description: 'Find businesses, buy and sell, hire services, and discover jobs across Bhutan.',
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
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
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
