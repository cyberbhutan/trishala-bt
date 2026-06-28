'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const businessId = parseInt(formData.get('business_id') as string)
  const rating = parseInt(formData.get('rating') as string)
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  if (!rating || rating < 1 || rating > 5) return

  await supabase.from('reviews').insert({
    business_id: businessId,
    user_id: user.id,
    rating,
    title,
    content,
    is_approved: false,
  })

  revalidatePath(`/business/${businessId}`)
}

export async function submitInquiry(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const businessId = parseInt(formData.get('business_id') as string)
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const message = formData.get('message') as string

  if (!name || !email || !message) return

  await supabase.from('inquiries').insert({
    business_id: businessId,
    name, email, phone, message,
  })

  // Increment inquiry count
  await (supabase.rpc as any)('increment_inquiry_count', { business_id: businessId })
}

export async function getBusinessInquiries(businessId: number) {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function markInquiryRead(id: number): Promise<void> {
  const supabase = await createServerSupabase()
  await supabase.from('inquiries').update({ is_read: true }).eq('id', id)
}
