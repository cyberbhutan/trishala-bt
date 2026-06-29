'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { reportListing } from '@/lib/actions/report'
import toast from 'react-hot-toast'

interface ReportButtonProps {
  itemType: string
  itemId: number
}

export default function ReportButton({ itemType, itemId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      toast.error('Please provide a reason')
      return
    }
    setSubmitting(true)
    const result = await reportListing(itemType, itemId, reason.trim())
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Report submitted. We\'ll review it shortly.')
      setOpen(false)
      setReason('')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors"
      >
        <Flag className="h-3 w-3" />
        Report
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-8 z-50 w-72 rounded-2xl border border-white/10 bg-[#0F172A] p-4 shadow-2xl backdrop-blur-xl"
        >
          <p className="mb-3 text-sm font-medium text-white">Report Listing</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you reporting this?"
            rows={3}
            className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-red-400/50 focus:outline-none"
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-red-500 px-3 py-2 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
