'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export async function recordView(businessId: number) {
  const supabase = await createServerSupabase()

  // Increment view count via raw SQL
  await supabase.from('businesses').update({ views_count: 0 }).eq('id', businessId).select()
  // Use a direct fetch and update approach
  const { data } = await supabase.from('businesses').select('views_count').eq('id', businessId).single()
  if (data) {
    await supabase.from('businesses').update({ views_count: (data.views_count || 0) + 1 }).eq('id', businessId)
  }

  // Record page view
  await supabase.from('page_views').insert({
    business_id: businessId,
    visitor_id: 'anon',
  })
}

export async function getBusinessAnalytics(businessId: number) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: business } = await supabase
    .from('businesses')
    .select('owner_id')
    .eq('id', businessId)
    .single()

  if (!business || business.owner_id !== user.id) return null

  const { count: totalViews } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: viewsToday } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', today.toISOString())

  const weekAgo = new Date(Date.now() - 7 * 86400000)
  const { count: viewsWeek } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', weekAgo.toISOString())

  const monthAgo = new Date(Date.now() - 30 * 86400000)
  const { count: viewsMonth } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', monthAgo.toISOString())

  const { data: viewsByDay } = await supabase
    .from('page_views')
    .select('created_at')
    .eq('business_id', businessId)
    .gte('created_at', monthAgo.toISOString())
    .order('created_at')

  const dayCounts: Record<string, number> = {}
  viewsByDay?.forEach(v => {
    const day = v.created_at.split('T')[0]
    dayCounts[day] = (dayCounts[day] || 0) + 1
  })

  const { count: totalInquiries } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  const { count: inquiriesMonth } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .gte('created_at', monthAgo.toISOString())

  const { data: biz } = await supabase
    .from('businesses')
    .select('avg_rating, review_count')
    .eq('id', businessId)
    .single()

  return {
    total_views: totalViews || 0,
    views_today: viewsToday || 0,
    views_this_week: viewsWeek || 0,
    views_this_month: viewsMonth || 0,
    total_inquiries: totalInquiries || 0,
    inquiries_this_month: inquiriesMonth || 0,
    avg_rating: biz?.avg_rating || 0,
    review_count: biz?.review_count || 0,
    views_by_day: Object.entries(dayCounts).map(([date, count]) => ({ date, count })),
  }
}
