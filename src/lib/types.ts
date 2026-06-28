export interface Business {
  id: number
  owner_id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  area: string | null
  latitude: number | null
  longitude: number | null
  cover_image: string | null
  logo_url: string | null
  photos: string[]
  whatsapp: string | null
  facebook: string | null
  instagram: string | null
  hours: Record<string, any>
  is_featured: boolean
  is_verified: boolean
  is_sponsored: boolean
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  tier: 'free' | 'featured' | 'spotlight'
  views_count: number
  inquiry_count: number
  avg_rating: number
  review_count: number
  created_at: string
  updated_at: string
  categories?: Category[]
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
}

export interface Review {
  id: number
  business_id: number
  user_id: string
  rating: number
  title: string | null
  content: string | null
  photos: string[]
  is_approved: boolean
  created_at: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export interface Inquiry {
  id: number
  business_id: number
  name: string
  email: string
  phone: string | null
  message: string
  is_read: boolean
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  is_admin: boolean
}

export interface Subscription {
  id: number
  business_id: number
  tier: 'featured' | 'spotlight'
  amount: number
  currency: string
  payment_method: string | null
  payment_ref: string | null
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  start_date: string
  end_date: string
}

export interface BusinessFormData {
  name: string
  slug?: string
  description?: string
  short_description?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  city?: string
  area?: string
  latitude?: number
  longitude?: number
  cover_image?: string
  logo_url?: string
  photos?: string[]
  whatsapp?: string
  facebook?: string
  instagram?: string
  hours?: Record<string, any>
  category_ids?: number[]
}

export interface BusinessAnalytics {
  total_views: number
  views_today: number
  views_this_week: number
  views_this_month: number
  total_inquiries: number
  inquiries_this_month: number
  avg_rating: number
  review_count: number
  views_by_day: { date: string; count: number }[]
}
