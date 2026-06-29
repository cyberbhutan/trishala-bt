'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reportListing(
  itemType: string,
  itemId: number,
  reason: string
): Promise<{ error?: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    await (supabase as any).from('reports').insert({
      item_type: itemType,
      item_id: itemId,
      user_id: user.id,
      reason,
    })
    revalidatePath('/')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to submit report' }
  }
}
