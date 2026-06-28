'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Classified, ClassifiedCategory } from '@/lib/types'

export async function createClassified(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const price_type = (formData.get('price_type') as string) || 'fixed'
  const condition = (formData.get('condition') as string) || 'good'
  const category_id = formData.get('category_id') as string
  const location = formData.get('location') as string
  const city = formData.get('city') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const whatsapp = formData.get('whatsapp') as string
  const imagesRaw = formData.get('images') as string

  if (!title || title.trim().length < 3) return

  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Date.now()

  const images: string[] = imagesRaw
    ? imagesRaw
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean)
    : []

  const { error } = await supabase.from('classifieds').insert({
    user_id: user.id,
    title: title.trim(),
    slug,
    description: description || null,
    price: price ? parseFloat(price) : null,
    price_type,
    condition,
    category_id: category_id ? parseInt(category_id) : null,
    location: location || null,
    city: city || null,
    images,
    phone: phone || null,
    email: email || null,
    whatsapp: whatsapp || null,
    status: 'active',
  })

  if (error) return

  revalidatePath('/classifieds')
  redirect('/classifieds')
}

export async function getClassifieds(options?: {
  category?: string
  city?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createServerSupabase()

  let query = supabase
    .from('classifieds')
    .select('*, categories:classified_categories(*)', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (options?.category) {
    const { data: cat } = await supabase
      .from('classified_categories')
      .select('id')
      .eq('slug', options.category)
      .single()
    if (cat) {
      query = query.eq('category_id', cat.id)
    }
  }

  if (options?.city) query = query.eq('city', options.city)
  if (options?.search) query = query.ilike('title', `%${options.search}%`)

  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset !== undefined && options?.limit) {
    query = query.range(options.offset, options.offset + options.limit - 1)
  }

  const { data, count } = await query
  return { classifieds: (data || []) as unknown as Classified[], total: count || 0 }
}

export async function getClassified(id: number) {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('classifieds')
    .select('*, categories:classified_categories(*)')
    .eq('id', id)
    .single()

  return data as unknown as Classified | null
}

export async function getClassifiedCategories() {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('classified_categories')
    .select('*')
    .order('name')

  return (data || []) as ClassifiedCategory[]
}

export async function incrementClassifiedView(id: number) {
  const supabase = await createServerSupabase()
  await supabase.rpc('increment_classified_view', { id })
}
