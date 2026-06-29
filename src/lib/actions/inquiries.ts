'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMyInquiries(userId: string) {
  const supabase = await createServerSupabase()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('owner_id', userId)

  if (!businesses || businesses.length === 0) {
    return []
  }

  const businessIds = businesses.map((b: any) => b.id)
  const businessMap = new Map(businesses.map((b: any) => [b.id, { name: b.name, slug: b.slug }]))

  const { data: inquiries } = await (supabase as any)
    .from('inquiries')
    .select('*')
    .in('business_id', businessIds)
    .order('created_at', { ascending: false })

  if (!inquiries) return []

  return inquiries.map((inquiry: any) => ({
    ...inquiry,
    business: businessMap.get(inquiry.business_id) || { name: 'Unknown', slug: '' },
  }))
}

export async function markInquiryRead(inquiryId: number): Promise<void> {
  const supabase = await createServerSupabase()
  await (supabase as any)
    .from('inquiries')
    .update({ is_read: true })
    .eq('id', inquiryId)
  revalidatePath('/dashboard/inquiries')
  revalidatePath('/dashboard')
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createServerSupabase()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', userId)

  if (!businesses || businesses.length === 0) return 0

  const businessIds = businesses.map((b: any) => b.id)

  const { count } = await (supabase as any)
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .in('business_id', businessIds)
    .eq('is_read', false)

  return count || 0
}
