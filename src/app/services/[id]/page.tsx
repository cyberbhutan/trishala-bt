import { createServerSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, MapPin, Phone, Mail, Globe, MessageCircle, Wrench, ArrowLeft, Calendar, Clock } from 'lucide-react'
import { formatDate, getWhatsAppLink } from '@/lib/utils'
import { bookService, submitServiceReview } from '@/lib/actions/services'

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const serviceId = parseInt(id)
  if (isNaN(serviceId)) notFound()

  const supabase = await createServerSupabase()

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (!service || service.status !== 'approved') notFound()

  const { data: reviews } = await supabase
    .from('service_reviews')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fire and forget view increment
  supabase.rpc('increment_service_view', { id: serviceId }).then()

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/services" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#34c759]/10 text-[#34c759]">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{service.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                    {service.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {service.city}</span>}
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-[#FF8A00] text-[#FF8A00]" />
                      {Number(service.avg_rating).toFixed(1)} ({service.review_count} reviews)
                    </span>
                  </div>
                </div>
              </div>
              {service.short_description && (
                <p className="text-sm text-white/60 leading-relaxed">{service.short_description}</p>
              )}
              {service.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-white/70 mb-2">Details</h3>
                  <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">{service.description}</p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white">Reviews</h2>
              {(!reviews || reviews.length === 0) ? (
                <p className="mt-3 text-sm text-white/40">No reviews yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34c759]/10 text-xs font-medium text-[#34c759]">U</div>
                        <div>
                          <p className="text-sm font-medium text-white">Anonymous</p>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-[#FF8A00] text-[#FF8A00]' : 'text-white/20'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.content && <p className="mt-2 text-sm text-white/50">{review.content}</p>}
                    </div>
                  ))}
                </div>
              )}

              <form action={submitServiceReview} className="mt-6 border-t border-white/5 pt-6">
                <h3 className="mb-4 text-sm font-medium text-white">Write a Review</h3>
                <input type="hidden" name="service_id" value={service.id} />
                <div className="mb-3">
                  <select name="rating" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-[#34c759]/50 focus:outline-none">
                    <option value="">Select rating</option>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} {n}/5</option>)}
                  </select>
                </div>
                <textarea name="content" rows={3} placeholder="Share your experience..." className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#34c759]/50 focus:outline-none" />
                <button type="submit" className="rounded-xl bg-[#34c759] px-6 py-2 text-sm font-medium text-white hover:bg-[#2db84d]">Submit Review</button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h3 className="text-sm font-semibold text-white">Pricing</h3>
              <p className="mt-2 text-2xl font-bold text-[#FF8A00]">
                {service.price ? `Nu. ${Number(service.price).toLocaleString()}${service.price_type === 'hourly' ? '/hr' : ''}` : service.price_type === 'free' ? 'Free' : 'Request Quote'}
              </p>
              <p className="mt-1 text-xs text-white/40 capitalize">{service.price_type} pricing</p>
            </div>

            {service.is_available && (
              <Link
                href={`/services/book/${service.id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#34c759] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2db84d]"
              >
                <Calendar className="h-4 w-4" /> Book Now
              </Link>
            )}

            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h3 className="text-sm font-semibold text-white">Contact</h3>
              <div className="mt-4 space-y-3 text-sm">
                {service.phone && (
                  <a href={`tel:${service.phone}`} className="flex items-center gap-3 text-white/60 hover:text-white">
                    <Phone className="h-4 w-4" /> {service.phone}
                  </a>
                )}
                {service.email && (
                  <a href={`mailto:${service.email}`} className="flex items-center gap-3 text-white/60 hover:text-white">
                    <Mail className="h-4 w-4" /> {service.email}
                  </a>
                )}
                {service.whatsapp && (
                  <a href={getWhatsAppLink(service.whatsapp, `Hi, I'm interested in ${service.title}`)} target="_blank" className="flex items-center gap-3 text-green-400 hover:text-green-300">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
