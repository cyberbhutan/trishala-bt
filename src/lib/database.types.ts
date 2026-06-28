// ═══════════════════════════════════════════════════════════════════
// Trishala.bt — Generated from supabase-schema.sql
// ═══════════════════════════════════════════════════════════════════

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: number
          owner_id: string | null
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
          hours: Json
          is_featured: boolean
          is_verified: boolean
          is_sponsored: boolean
          status: Database['public']['Enums']['business_status']
          tier: Database['public']['Enums']['business_tier']
          views_count: number
          inquiry_count: number
          avg_rating: number
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          owner_id?: string | null
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          area?: string | null
          latitude?: number | null
          longitude?: number | null
          cover_image?: string | null
          logo_url?: string | null
          photos?: string[]
          whatsapp?: string | null
          facebook?: string | null
          instagram?: string | null
          hours?: Json
          is_featured?: boolean
          is_verified?: boolean
          is_sponsored?: boolean
          status?: Database['public']['Enums']['business_status']
          tier?: Database['public']['Enums']['business_tier']
          views_count?: number
          inquiry_count?: number
          avg_rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          owner_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          area?: string | null
          latitude?: number | null
          longitude?: number | null
          cover_image?: string | null
          logo_url?: string | null
          photos?: string[]
          whatsapp?: string | null
          facebook?: string | null
          instagram?: string | null
          hours?: Json
          is_featured?: boolean
          is_verified?: boolean
          is_sponsored?: boolean
          status?: Database['public']['Enums']['business_status']
          tier?: Database['public']['Enums']['business_tier']
          views_count?: number
          inquiry_count?: number
          avg_rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'businesses_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      business_categories: {
        Row: {
          business_id: number
          category_id: number
        }
        Insert: {
          business_id: number
          category_id: number
        }
        Update: {
          business_id?: number
          category_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'business_categories_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'business_categories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: number
          business_id: number
          user_id: string
          rating: number
          title: string | null
          content: string | null
          photos: string[]
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          user_id: string
          rating: number
          title?: string | null
          content?: string | null
          photos?: string[]
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          user_id?: string
          rating?: number
          title?: string | null
          content?: string | null
          photos?: string[]
          is_approved?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      inquiries: {
        Row: {
          id: number
          business_id: number
          name: string
          email: string
          phone: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          name: string
          email: string
          phone?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          name?: string
          email?: string
          phone?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inquiries_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      subscriptions: {
        Row: {
          id: number
          business_id: number
          tier: Database['public']['Enums']['subscription_tier']
          amount: number
          currency: string
          payment_method: string | null
          payment_ref: string | null
          status: Database['public']['Enums']['subscription_status']
          start_date: string
          end_date: string
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          tier: Database['public']['Enums']['subscription_tier']
          amount: number
          currency?: string
          payment_method?: string | null
          payment_ref?: string | null
          status?: Database['public']['Enums']['subscription_status']
          start_date: string
          end_date: string
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          tier?: Database['public']['Enums']['subscription_tier']
          amount?: number
          currency?: string
          payment_method?: string | null
          payment_ref?: string | null
          status?: Database['public']['Enums']['subscription_status']
          start_date?: string
          end_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      page_views: {
        Row: {
          id: number
          business_id: number
          visitor_id: string | null
          referrer: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: number
          business_id: number
          visitor_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          business_id?: number
          visitor_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'page_views_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<string, never>
        Returns: undefined
      }
      update_business_rating: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {
      business_status: 'pending' | 'approved' | 'rejected' | 'suspended'
      business_tier: 'free' | 'featured' | 'spotlight'
      subscription_tier: 'featured' | 'spotlight'
      subscription_status: 'pending' | 'active' | 'expired' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
