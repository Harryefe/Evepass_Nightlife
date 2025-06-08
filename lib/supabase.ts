import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl !== 'https://placeholder.supabase.co' && 
                           supabaseAnonKey !== 'placeholder-key' &&
                           supabaseUrl.includes('.supabase.co')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: hasValidCredentials,
    persistSession: hasValidCredentials,
    detectSessionInUrl: hasValidCredentials
  }
})

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => hasValidCredentials

// Database types
export interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  date_of_birth?: string
  postcode?: string
  music_preferences?: string[]
  user_type: 'customer'
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  email: string
  business_name: string
  business_type: string
  address?: string
  postcode?: string
  capacity?: number
  phone?: string
  description?: string
  user_type: 'business'
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  business_id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  available: boolean
  popular?: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  business_id: string
  total_amount: number
  payment_method: 'card' | 'cash'
  payment_status: 'pending' | 'completed' | 'failed' | 'cash_pending'
  cash_code?: string
  table_number?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string
  business_id: string
  table_id?: string
  booking_date: string
  party_size: number
  table_preference?: string
  special_requests?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  deposit_amount?: number
  total_spend?: number
  created_at: string
  updated_at: string
}

export interface VenueTable {
  id: string
  business_id: string
  table_name: string
  table_type: 'regular' | 'vip' | 'bar' | 'private'
  capacity: number
  minimum_spend?: number
  available: boolean
  created_at: string
  updated_at: string
}