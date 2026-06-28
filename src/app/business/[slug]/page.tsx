import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { Star, MapPin, Phone, Mail, Globe, Clock, MessageCircle, ExternalLink, Store } from 'lucide-react'
import Link from 'next/link'
import { formatDate, getWhatsAppLink } from '@/lib/utils'
import { recordView } from '@/lib/actions/analytics'
import { submitReview, submitInquiry } from '@/lib/actions/reviews'
import ShareButtons from '@/components/ui/ShareButtons'
import { ListingCard } from '@/components/ui/ListingCard'

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabase()

  const { data: business } = await supabase
    .from('businesses')
    .select(`
      *,
      categories:business_categories(category_id, categories(id, name, slug, icon))
    `)
    .eq('slug', slug)
    .single()

  if (!business || business.status !== 'approved') notFound()

  // Record view (fire and forget)
  recordView(business.id)

  // Get reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', business.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10)

  const reviewerIds = [...new Set((reviews || []).map(r => r.user_id).filter((id): id is string => id !== null))]
  const { data: reviewerProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', reviewerIds.length > 0 ? reviewerIds : ['none'])

  const profileMap = new Map((reviewerProfiles || []).map(p => [p.id, p]))

  // Get similar businesses
  const { data: similar } = await supabase
    .from('businesses')
    .select('id, name, slug, short_description, city, avg_rating, review_count, is_verified, is_featured, cover_image')
    .eq('status', 'approved')
    .neq('slug', slug)
    .limit(3)

  const images: string[] = [
    ...(business.cover_image ? [business.cover_image] : []),
    ...(business.photos || []),
  ]

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-r from-[#003B82]/30 to-[#0F172A] sm:h-64 lg:h-80">
        {business.cover_image && (
          <img src={business.cover_image} alt={business.name} className="h-full w-full object-cover" />
        )}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
            {images.length} photo{images.length > 1 ? 's' : ''}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Business Header */}
        <div className="-mt-20 relative z-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-[#0F172A] text-2xl font-bold text-white shadow-xl">
                {business.logo_url ? (
                  <img src={business.logo_url} alt="" className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  business.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">{business.name}</h1>
                  {business.is_verified && (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                      Verified
                    </span>
                  )}
                  {business.is_featured && (
                    <span className="rounded-full bg-[#FF8A00]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#FF8A00] border border-[#FF8A00]/20">
                      Featured
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/50">
                  {business.city && (
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {business.city}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[#FF8A00] text-[#FF8A00]" />
                    {Number(business.avg_rating).toFixed(1)} ({business.review_count} {business.review_count === 1 ? 'review' : 'reviews'})
                  </span>
                  <span className="text-white/30">Listed {formatDate(business.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShareButtons title={business.name} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={`h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                      i === 0 ? 'border-[#FF8A00]/50 ring-1 ring-[#FF8A00]/30' : 'border-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt={`${business.name} photo ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* About */}
            <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white">About</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{business.description || business.short_description || 'No description provided.'}</p>
              
              {/* Business Hours */}
              {business.hours && Object.keys(business.hours).length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-white/40" />
                    <h3 className="text-sm font-medium text-white/70">Business Hours</h3>
                  </div>
                  <div className="space-y-1.5 text-sm text-white/50">
                    {Object.entries(business.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between border-b border-white/5 pb-1 last:border-0">
                        <span className="capitalize font-medium text-white/60">{day}</span>
                        <span>{hours as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {true && (business as any).categories && (business as any).categories.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {(business as any).categories?.map((bc: any) => (
                    <span key={bc.category_id} className="rounded-full bg-[#003B82]/10 px-3 py-1 text-xs text-[#60A5FA] border border-[#003B82]/20">
                      {bc.categories?.name}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white">
                Reviews
                {reviews && reviews.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-white/40">({reviews.length})</span>
                )}
              </h2>
              {(!reviews || reviews.length === 0) ? (
                <p className="mt-3 text-sm text-white/40">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((review) => {
                    const profile = profileMap.get(review.user_id ?? '')
                    return (
                      <div key={review.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8A00]/20 to-[#003B82]/20 text-xs font-medium text-[#FF8A00]">
                            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{profile?.full_name || 'Anonymous'}</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-[#FF8A00] text-[#FF8A00]' : 'text-white/20'}`} />
                              ))}
                              <span className="ml-1 text-[11px] text-white/30">{formatDate(review.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        {review.title && <p className="mt-2 text-sm font-medium text-white">{review.title}</p>}
                        {review.content && <p className="mt-1 text-sm text-white/50 leading-relaxed">{review.content}</p>}
                      </div>
                    )
                  })}
                </div>
              )}
              <form action={submitReview} className="mt-6 border-t border-white/5 pt-6">
                <h3 className="mb-4 text-sm font-medium text-white">Write a Review</h3>
                <input type="hidden" name="business_id" value={business.id} />
                <div className="mb-3">
                  <select name="rating" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-[#FF8A00]/50 focus:outline-none">
                    <option value="">Select rating</option>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)} {n}/5</option>)}
                  </select>
                </div>
                <input name="title" placeholder="Review title (optional)" className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none" />
                <textarea name="content" rows={3} placeholder="Share your experience..." className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none" />
                <button type="submit" className="rounded-xl bg-[#FF8A00] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#E67A00] transition-all active:scale-[0.97]">
                  Submit Review
                </button>
              </form>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h3 className="text-sm font-semibold text-white">Contact</h3>
              <div className="mt-4 space-y-3 text-sm">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                    <Phone className="h-4 w-4 text-[#FF8A00]" /> {business.phone}
                  </a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                    <Mail className="h-4 w-4 text-[#FF8A00]" /> {business.email}
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
                    <Globe className="h-4 w-4 text-[#FF8A00]" /> Visit Website
                  </a>
                )}
                {business.whatsapp && (
                  <a href={getWhatsAppLink(business.whatsapp, `Hi, I'm interested in ${business.name}`)} target="_blank" className="flex items-center gap-3 text-green-400 hover:text-green-300 transition-colors">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Social */}
            {(business.facebook || business.instagram) && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <h3 className="text-sm font-semibold text-white">Social</h3>
                <div className="mt-3 flex gap-3">
                  {business.facebook && (
                    <a href={business.facebook} target="_blank" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {business.instagram && (
                    <a href={business.instagram} target="_blank" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {business.latitude && business.longitude && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
                <h3 className="text-sm font-semibold text-white">Location</h3>
                {business.address && <p className="mt-2 text-sm text-white/50">{business.address}</p>}
                <div className="mt-3 overflow-hidden rounded-xl border border-white/5">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.longitude - 0.01}%2C${business.latitude - 0.01}%2C${business.longitude + 0.01}%2C${business.latitude + 0.01}&layer=mapnik&marker=${business.latitude}%2C${business.longitude}`}
                    width="100%"
                    height="180"
                    style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg)' }}
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps?q=${business.latitude},${business.longitude}`}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-2 text-xs text-[#FF8A00] hover:underline"
                >
                  <MapPin className="h-3 w-3" /> View on Google Maps
                </a>
              </div>
            )}

            {/* Send Inquiry */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
              <h3 className="text-sm font-semibold text-white">Send Inquiry</h3>
              <form action={submitInquiry} className="mt-4 space-y-3">
                <input type="hidden" name="business_id" value={business.id} />
                <input name="name" required placeholder="Your name" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none" />
                <input name="email" type="email" required placeholder="Your email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none" />
                <input name="phone" placeholder="Phone (optional)" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none" />
                <textarea name="message" rows={3} required placeholder="Your message..." className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#FF8A00]/50 focus:outline-none" />
                <button type="submit" className="w-full rounded-xl bg-[#FF8A00] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#E67A00] transition-all active:scale-[0.97]">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Similar Businesses */}
        {similar && similar.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-white">Similar Businesses</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((biz) => (
                <ListingCard key={biz.id} variant="business" item={biz as any} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
