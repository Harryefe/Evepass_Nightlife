import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  user_type: 'customer' | 'business'
  profile: any
}

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userData.user_type,
          ...userData
        }
      }
    })

    if (error) throw error

    // Create profile in appropriate table
    if (data.user && userData.user_type === 'customer') {
      const { error: profileError } = await supabase
        .from('customers')
        .insert({
          id: data.user.id,
          email: data.user.email,
          ...userData
        })
      
      if (profileError) throw profileError
    } else if (data.user && userData.user_type === 'business') {
      const { error: profileError } = await supabase
        .from('businesses')
        .insert({
          id: data.user.id,
          email: data.user.email,
          ...userData
        })
      
      if (profileError) throw profileError
    }

    return data
  },

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user with profile
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const userType = user.user_metadata?.user_type || 'customer'
    const tableName = userType === 'customer' ? 'customers' : 'businesses'
    
    const { data: profile } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      user_type: userType,
      profile
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  }
}