'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ServiceListing } from '@/lib/types'

/* ═══════════════════════════════════════════════════════════════════
   Fetch service categories
   ═══════════════════════════════════════════════════════════════════ */

export async function getServiceCategories() {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('service_categories')
    .select('*')
    .order('name')
  return data || []
}

/* ═══════════════════════════════════════════════════════════════════
   Fetch services list with filters
   ═══════════════════════════════════════════════════════════════════ */

export async function getServices(options?: {
  category?: string
  city?: string
  search?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createServerSupabase()

  let query = supabase
    .from('services')
    .select('*', { count: 'exact' })

  if (options?.status) {
    query = query.eq('status', options.status)
  } else {
    query = query.eq('status', 'approved')
  }

  if (options?.category) {
    const { data: cat } = await supabase
      .from('service_categories')
      .select('id')
      .eq('slug', options.category)
      .single()
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  if (options?.city) query = query.eq('city', options.city)
  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,short_description.ilike.%${options.search}%`)
  }

  query = query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 12) - 1
    )
  }

  const { data, count } = await query
  return { services: (data || []) as ServiceListing[], total: count || 0 }
}

/* ═══════════════════════════════════════════════════════════════════
   Fetch single service by ID
   ═══════════════════════════════════════════════════════════════════ */

export async function getServiceById(id: number) {
  const supabase = await createServerSupabase()

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (!service) return null

  return {
    service: service as unknown as ServiceListing,
    reviews: [],
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Create a new service listing
   ═══════════════════════════════════════════════════════════════════ */

export async function createService(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const shortDescription = formData.get('short_description') as string
  const description = formData.get('description') as string
  const categoryId = formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null
  const priceType = (formData.get('price_type') || 'quote') as string
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
  const location = formData.get('location') as string
  const city = formData.get('city') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const whatsapp = formData.get('whatsapp') as string

  if (!title) return { error: 'Title is required' }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) + '-' + Date.now()

  const { error } = await supabase
    .from('services')
    .insert({
      provider_id: user.id,
      title,
      slug,
      short_description: shortDescription || null,
      description: description || null,
      category_id: categoryId,
      price_type: priceType,
      price,
      location: location || null,
      city: city || null,
      phone: phone || null,
      email: email || null,
      whatsapp: whatsapp || null,
      is_available: true,
      status: 'pending',
      images: [],
    })

  if (error) return { error: error.message }

  revalidatePath('/services')
  redirect('/services')
}

/* ═══════════════════════════════════════════════════════════════════
   Book a service
   ═══════════════════════════════════════════════════════════════════ */

export async function bookService(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const serviceId = parseInt(formData.get('service_id') as string)
  const clientName = formData.get('client_name') as string
  const clientEmail = formData.get('client_email') as string
  const clientPhone = formData.get('client_phone') as string
  const message = formData.get('message') as string
  const preferredDate = formData.get('preferred_date') as string
  const preferredTime = formData.get('preferred_time') as string

  if (!serviceId || !clientName || !clientEmail) {
    return { error: 'Service ID, name, and email are required' }
  }

  const { error } = await supabase
    .from('service_bookings')
    .insert({
      service_id: serviceId,
      client_id: user.id,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone || null,
      message: message || null,
      preferred_date: preferredDate || null,
      preferred_time: preferredTime || null,
      status: 'pending',
    })

  if (error) return { error: error.message }

  revalidatePath(`/services/${serviceId}`)
  revalidatePath('/services')
  return { error: undefined }
}

/* ═══════════════════════════════════════════════════════════════════
   Submit a review for a service
   ═══════════════════════════════════════════════════════════════════ */

export async function submitServiceReview(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const serviceId = parseInt(formData.get('service_id') as string)
  const rating = parseInt(formData.get('rating') as string)
  const content = formData.get('content') as string

  if (!serviceId || !rating || rating < 1 || rating > 5) return

  await supabase.from('service_reviews').insert({
    service_id: serviceId,
    user_id: user.id,
    rating,
    content: content || null,
  })

  revalidatePath(`/services/${serviceId}`)
}
