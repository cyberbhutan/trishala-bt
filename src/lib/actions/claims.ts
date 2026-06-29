'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ClaimRequest {
  id: number
  business_id: number
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  message?: string | null
  created_at: string
  updated_at: string
}

/**
 * Submit a claim for a business.
 * Expects formData with business_id and optional message.
 */
export async function submitClaim(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const businessId = parseInt(formData.get('business_id') as string, 10)
  const message = (formData.get('message') as string) || undefined

  if (!businessId || isNaN(businessId)) return

  // Check if business exists and has no owner
  const { data: business } = await supabase
    .from('businesses')
    .select('id, owner_id, slug')
    .eq('id', businessId)
    .single()

  if (!business) return
  if (business.owner_id) return

  // Check if user already has a pending claim for this business
  const { data: existingClaim } = await (supabase as any)
    .from('claim_requests')
    .select('id, status')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingClaim) {
    if (existingClaim.status === 'pending') return
    if (existingClaim.status === 'approved') return
  }

  await (supabase as any)
    .from('claim_requests')
    .insert({
      business_id: businessId,
      user_id: user.id,
      status: 'pending',
      message: message || null,
    })

  revalidatePath(`/business/${business.slug}`)
}

/**
 * Get all claims for the current user.
 */
export async function getUserClaims(): Promise<ClaimRequest[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await (supabase as any)
    .from('claim_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data || []) as ClaimRequest[]
}

/**
 * Get all pending claims (admin only).
 * Returns claim requests joined with business name and user profile info.
 */
export async function getPendingClaims(): Promise<any[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return []

  // Use raw join-query approach; Supabase auto-resolves FK relations
  const { data } = await (supabase as any)
    .from('claim_requests')
    .select(`
      *,
      business:businesses(name, slug),
      profile:profiles!user_id(full_name, avatar_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Approve a claim (admin only).
 * Sets the business owner_id, marks it verified, and updates claim status.
 */
export async function approveClaim(claimId: number): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return

  // Get claim details
  const { data: claim } = await (supabase as any)
    .from('claim_requests')
    .select('*')
    .eq('id', claimId)
    .single()

  if (!claim || claim.status !== 'pending') return

  // Update business: set owner_id and verified
  await supabase
    .from('businesses')
    .update({
      owner_id: claim.user_id,
      is_verified: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', claim.business_id)

  // Update claim status to approved
  await (supabase as any)
    .from('claim_requests')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', claimId)

  revalidatePath('/admin')
  revalidatePath(`/business/${claim.business_id}`)
}

/**
 * Reject a claim (admin only).
 */
export async function rejectClaim(claimId: number): Promise<void> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return

  await (supabase as any)
    .from('claim_requests')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', claimId)

  revalidatePath('/admin')
}
