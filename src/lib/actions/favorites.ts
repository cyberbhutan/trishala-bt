'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export interface FavoriteRow {
  id: number
  user_id: string
  item_type: string
  item_id: number
  created_at: string
}

/**
 * Toggle a favorite for the authenticated user.
 * Handles the case where the `favorites` table doesn't exist yet.
 */
export async function toggleFavorite(
  itemType: string,
  itemId: number
): Promise<{ action: 'added' | 'removed' } | { error: string }> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    const db = supabase as any

    // Check if already favorited
    const { data: existing } = await db
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle()

    if (existing) {
      const { error } = await db
        .from('favorites')
        .delete()
        .eq('id', existing.id)

      if (error) return { error: error.message }
      return { action: 'removed' }
    } else {
      const { error } = await db
        .from('favorites')
        .insert({ user_id: user.id, item_type: itemType, item_id: itemId })

      if (error) return { error: error.message }
      return { action: 'added' }
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to toggle favorite'
    return { error: message }
  }
}

/**
 * Get all favorites for a given user.
 */
export async function getUserFavorites(
  userId: string
): Promise<FavoriteRow[]> {
  const supabase = await createServerSupabase()

  try {
    const { data } = await (supabase as any)
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return (data || []) as FavoriteRow[]
  } catch {
    return []
  }
}

/**
 * Check if a specific item is favorited by the current user.
 */
export async function isFavorited(
  itemType: string,
  itemId: number
): Promise<boolean> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  try {
    const { data } = await (supabase as any)
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle()

    return !!data
  } catch {
    return false
  }
}
