'use client'

import { useState } from 'react'
import { Share2, Link2, Globe, Mail, Check, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareButtonsProps {
  title: string
  url?: string
  className?: string
}

export default function ShareButtons({ title, url, className = '' }: ShareButtonsProps) {
  const [open, setOpen] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const shareLinks = [
    {
      name: 'Copy Link',
      icon: Link2,
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl)
          toast.success('Link copied!')
        } catch {
          toast.error('Failed to copy')
        }
      },
      color: 'text-white/60 hover:text-white hover:bg-white/10',
    },
    {
      name: 'Facebook',
      icon: Globe,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener')
      },
      color: 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10',
    },
    {
      name: 'X / Twitter',
      icon: MessageCircle,
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener')
      },
      color: 'text-sky-400 hover:text-sky-300 hover:bg-sky-500/10',
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check this out: ${shareUrl}`)}`
      },
      color: 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10',
    },
  ]

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-[#FF8A00]/20 hover:bg-[#FF8A00]/5 hover:text-white"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-52 animate-fade-in rounded-2xl border border-white/10 bg-[#1a2332] p-2 shadow-2xl backdrop-blur-xl">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-white/40">Share</p>
            {shareLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  link.action()
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${link.color}`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
