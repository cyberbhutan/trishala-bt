'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Mail, Phone, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase/client'
import { bookService } from '@/lib/actions/services'

export default function BookServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = parseInt(params.id as string)
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchService() {
      const supabase = createClientSupabase()
      const { data } = await supabase.from('services').select('id, title, price, price_type, city, provider_id').eq('id', serviceId).single()
      if (data) setService(data)
      setLoading(false)
    }
    if (serviceId) fetchService()
  }, [serviceId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('service_id', String(serviceId))
    await bookService(formData)
    setSubmitting(false)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/30" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <p className="text-white/40">Service not found</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#34c759]" />
          <h2 className="mt-4 text-xl font-bold text-white">Booking Request Sent!</h2>
          <p className="mt-2 text-sm text-white/50">The service provider will contact you shortly.</p>
          <Link href="/services" className="mt-6 inline-block rounded-xl bg-[#FF8A00] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#E67A00]">
            Back to Services
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href={`/services/${serviceId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80">
          <ArrowLeft className="h-4 w-4" /> Back to service
        </Link>

        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 mb-6">
          <h1 className="text-xl font-bold text-white">Book: {service.title}</h1>
          <p className="mt-1 text-sm text-white/50">
            {service.price ? `Nu. ${Number(service.price).toLocaleString()}${service.price_type === 'hourly' ? '/hr' : ''}` : 'Request Quote'} 
            {service.city ? ` · ${service.city}` : ''}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 sm:p-8 space-y-5">
          <input type="hidden" name="service_id" value={serviceId} />
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Your Name <span className="text-[#FF8A00]">*</span></label>
            <input name="client_name" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#34c759]/50 focus:outline-none" placeholder="Your full name" />
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Email <span className="text-[#FF8A00]">*</span></label>
            <input name="client_email" type="email" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#34c759]/50 focus:outline-none" placeholder="your@email.com" />
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Phone</label>
            <input name="client_phone" type="tel" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#34c759]/50 focus:outline-none" placeholder="+975 17 123 456" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Preferred Date</label>
              <input name="preferred_date" type="date" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-[#34c759]/50 focus:outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Preferred Time</label>
              <input name="preferred_time" type="time" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-[#34c759]/50 focus:outline-none [color-scheme:dark]" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Message</label>
            <textarea name="message" rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#34c759]/50 focus:outline-none" placeholder="Describe what you need..." />
          </div>

          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#34c759] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2db84d] disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Sending...' : 'Send Booking Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
