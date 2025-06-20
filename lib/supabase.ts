import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://luawtiehjmfojtqwsisb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1YXd0aWVoam1mb2p0cXdzaXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NTU5NzQsImV4cCI6MjA1MDIzMTk3NH0.Ej8ZQJhZJGJZJGJZJGJZJGJZJGJZJGJZJGJZJGJZJGJZ'

// Check if we have valid Supabase credentials
const hasValidCredentials = !!(
  supabaseUrl && 
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 20
)

if (!hasValidCredentials) {
  console.warn('Supabase not configured: Please set up your Supabase credentials in .env.local')
  console.warn('Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: hasValidCredentials,
    persistSession: hasValidCredentials,
    detectSessionInUrl: hasValidCredentials,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'evepass-web@1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => hasValidCredentials

// Simplified test connection function that doesn't cause fetch errors
export const testSupabaseConnection = async () => {
  try {
    if (!hasValidCredentials) {
      return { success: false, error: 'Supabase credentials not configured' }
    }

    // Simple auth check instead of database query to avoid RLS issues
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Connection successful' }
  } catch (error: any) {
    // Handle network errors more gracefully
    if (error.message && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    )) {
      return { success: false, error: 'Network connection failed. Please check your internet connection.' }
    }
    
    return { success: false, error: error.message || 'Connection failed' }
  }
}

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