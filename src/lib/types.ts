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

// ════════════════════════════════════════
// NEW: Classified Types
// ════════════════════════════════════════

export interface ClassifiedCategory {
  id: number
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export interface Classified {
  id: number
  user_id: string | null
  title: string
  slug: string
  description: string | null
  price: number | null
  price_type: 'fixed' | 'negotiable' | 'free' | 'exchange'
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'used'
  category_id: number | null
  location: string | null
  city: string | null
  images: string[]
  phone: string | null
  email: string | null
  whatsapp: string | null
  status: 'active' | 'sold' | 'expired' | 'deleted'
  views_count: number
  created_at: string
  updated_at: string
  categories?: ClassifiedCategory
}

// ════════════════════════════════════════
// NEW: Service Marketplace Types
// ════════════════════════════════════════

export interface ServiceCategory {
  id: number
  name: string
  slug: string
  icon: string | null
  description: string | null
  created_at: string
}

export interface ServiceListing {
  id: number
  provider_id: string | null
  title: string
  slug: string
  description: string | null
  short_description: string | null
  category_id: number | null
  price_type: 'fixed' | 'hourly' | 'quote' | 'free'
  price: number | null
  location: string | null
  city: string | null
  cover_image: string | null
  images: string[]
  phone: string | null
  email: string | null
  whatsapp: string | null
  is_available: boolean
  is_featured: boolean
  avg_rating: number
  review_count: number
  booking_count: number
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  views_count: number
  created_at: string
  updated_at: string
  categories?: ServiceCategory
}

export interface ServiceBooking {
  id: number
  service_id: number
  client_id: string
  client_name: string
  client_email: string
  client_phone: string | null
  message: string | null
  preferred_date: string | null
  preferred_time: string | null
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

// ════════════════════════════════════════
// NEW: Job Types
// ════════════════════════════════════════

export interface JobCategory {
  id: number
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export interface Job {
  id: number
  employer_id: string | null
  title: string
  slug: string
  company_name: string
  company_logo: string | null
  description: string
  requirements: string | null
  responsibilities: string | null
  category_id: number | null
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'volunteer'
  work_type: 'on-site' | 'remote' | 'hybrid'
  location: string | null
  city: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  salary_period: 'hourly' | 'daily' | 'monthly' | 'yearly'
  application_email: string | null
  application_url: string | null
  application_deadline: string | null
  is_featured: boolean
  is_urgent: boolean
  status: 'active' | 'filled' | 'expired' | 'draft'
  views_count: number
  application_count: number
  created_at: string
  updated_at: string
  categories?: JobCategory
}

export interface JobApplication {
  id: number
  job_id: number
  applicant_id: string
  applicant_name: string
  applicant_email: string
  applicant_phone: string | null
  cover_letter: string | null
  resume_url: string | null
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
  created_at: string
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
