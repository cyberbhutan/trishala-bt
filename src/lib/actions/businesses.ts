'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createBusiness(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const name = formData.get('name') as string
  const shortDescription = formData.get('short_description') as string
  const description = formData.get('description') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const website = formData.get('website') as string
  const city = formData.get('city') as string
  const area = formData.get('area') as string
  const whatsapp = formData.get('whatsapp') as string
  const facebook = formData.get('facebook') as string
  const instagram = formData.get('instagram') as string
  const categoryIds = formData.getAll('category_ids').map(Number)

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()

  const { data: business } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      name,
      slug,
      short_description: shortDescription,
      description,
      phone,
      email,
      website,
      city,
      area,
      whatsapp,
      facebook,
      instagram,
      status: 'pending' as const,
      tier: 'free' as const,
    })
    .select()
    .single()

  if (business && categoryIds.length > 0) {
    await supabase.from('business_categories').insert(
      categoryIds.map(cid => ({ business_id: business.id, category_id: cid }))
    )
  }

  revalidatePath('/business/listings')
  redirect('/business/listings')
}

export async function updateBusiness(id: number, data: Record<string, any>) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { category_ids, ...businessData } = data

  const { error } = await (supabase.from('businesses') as any).update({
     ...businessData,
     updated_at: new Date().toISOString(),
   })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  if (category_ids) {
    await supabase.from('business_categories').delete().eq('business_id', id)
    await supabase.from('business_categories').insert(
      category_ids.map((cid: number) => ({ business_id: id, category_id: cid }))
    )
  }

  revalidatePath(`/business/${id}`)
  revalidatePath('/business/listings')
  return { success: true }
}

export async function deleteBusiness(id: number) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/business/listings')
  redirect('/business/listings')
}

export async function getBusinessBySlug(slug: string) {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

export async function getBusinesses(options?: {
  category?: string
  city?: string
  search?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createServerSupabase()

  let query = supabase
    .from('businesses')
    .select('*', { count: 'exact' })

  if (options?.status) query = (query as any).eq('status', options.status)
  else query = query.eq('status', 'approved')

  if (options?.city) query = query.eq('city', options.city)
  if (options?.search) query = query.ilike('name', `%${options.search}%`)

  query = query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 12) - 1)

  const { data, count } = await query
  return { businesses: data || [], total: count || 0 }
}

export async function getCategories() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.from('categories').select('*').order('name')
  return data || []
}

export async function approveBusiness(id: number): Promise<void> {
  const supabase = await createServerSupabase()
  await supabase
    .from('businesses')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function rejectBusiness(id: number): Promise<void> {
  const supabase = await createServerSupabase()
  await supabase
    .from('businesses')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin')
  revalidatePath('/')
}
