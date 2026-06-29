'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Eye, Check, ArrowRight } from 'lucide-react'
import { markInquiryRead } from '@/lib/actions/inquiries'

export default function InquiriesClient({ inquiries }: { inquiries: any[] }) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [localInquiries, setLocalInquiries] = useState(inquiries)

  const handleToggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleMarkRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await markInquiryRead(id)
    setLocalInquiries(prev =>
      prev.map(i => i.id === id ? { ...i, is_read: true } : i)
    )
    router.refresh()
  }

  const unreadCount = localInquiries.filter(i => !i.is_read).length

  return (
    <div>
      {/* Summary bar */}
      <div className="mb-4 flex items-center gap-3 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <Mail className="h-3.5 w-3.5" />
          {localInquiries.length} total
        </span>
        {unreadCount > 0 && (
          <>
            <span className="text-white/20">·</span>
            <span className="text-[#FF8A00]">{unreadCount} unread</span>
          </>
        )}
      </div>

      {/* Inquiries table */}
      <div className="overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-3 font-medium text-white/50 w-8"></th>
              <th className="px-4 py-3 font-medium text-white/50">Name</th>
              <th className="px-4 py-3 font-medium text-white/50">Email</th>
              <th className="px-4 py-3 font-medium text-white/50">Business</th>
              <th className="px-4 py-3 font-medium text-white/50">Message</th>
              <th className="px-4 py-3 font-medium text-white/50">Date</th>
              <th className="px-4 py-3 font-medium text-white/50">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {localInquiries.map((inquiry: any) => (
              <tr key={inquiry.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02] cursor-pointer" onClick={() => handleToggleExpand(inquiry.id)}>
                <td className="px-4 py-3">
                  {!inquiry.is_read && (
                    <span className="flex h-2 w-2 rounded-full bg-[#FF8A00]" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className={`font-medium text-white ${!inquiry.is_read ? 'font-semibold' : ''}`}>{inquiry.name}</p>
                  {inquiry.phone && (
                    <p className="text-xs text-white/30 mt-0.5">{inquiry.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-white/70">{inquiry.email}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/business/${inquiry.business.slug}`}
                    className="text-[#FF8A00] hover:text-[#E67A00] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {inquiry.business.name}
                  </Link>
                </td>
                <td className="px-4 py-3 max-w-[240px]">
                  {expandedId === inquiry.id ? (
                    <p className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap">{inquiry.message}</p>
                  ) : (
                    <p className="text-white/50 text-xs truncate">
                      {inquiry.message?.substring(0, 80)}{inquiry.message?.length > 80 ? '...' : ''}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {inquiry.is_read ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/40">
                      <Check className="h-3 w-3" /> Read
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleMarkRead(inquiry.id, e)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#FF8A00]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#FF8A00] hover:bg-[#FF8A00]/20 transition-colors"
                    >
                      <Eye className="h-3 w-3" /> Mark read
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ArrowRight className={`h-4 w-4 text-white/20 transition-transform ${expandedId === inquiry.id ? 'rotate-90' : ''}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <p className="mt-3 text-xs text-white/20 text-center">
        Click any row to expand the full message
      </p>
    </div>
  )
}
