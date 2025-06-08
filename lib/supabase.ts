import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  business_id: string
  items: any[]
  total_amount: number
  payment_method: 'card' | 'cash'
  payment_status: 'pending' | 'completed' | 'failed' | 'cash_pending'
  cash_code?: string
  table_number?: string
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string
  business_id: string
  booking_date: string
  party_size: number
  table_preference?: string
  special_requests?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  created_at: string
}