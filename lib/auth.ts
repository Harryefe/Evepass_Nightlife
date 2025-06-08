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
    try {
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userData.user_type,
            ...userData
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('User creation failed')
      }

      // Wait a moment for the auth state to be established
      await new Promise(resolve => setTimeout(resolve, 100))

      // Create profile in appropriate table with explicit user ID
      const profileData = {
        id: authData.user.id,
        email: authData.user.email,
        ...userData
      }

      if (userData.user_type === 'customer') {
        const { error: profileError } = await supabase
          .from('customers')
          .insert(profileData)
        
        if (profileError) {
          console.error('Customer profile creation error:', profileError)
          throw new Error(`Failed to create customer profile: ${profileError.message}`)
        }
      } else if (userData.user_type === 'business') {
        const { error: profileError } = await supabase
          .from('businesses')
          .insert(profileData)
        
        if (profileError) {
          console.error('Business profile creation error:', profileError)
          throw new Error(`Failed to create business profile: ${profileError.message}`)
        }
      }

      return authData
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      const userType = user.user_metadata?.user_type || 'customer'
      const tableName = userType === 'customer' ? 'customers' : 'businesses'
      
      const { data: profile, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        return null
      }

      return {
        id: user.id,
        email: user.email!,
        user_type: userType,
        profile
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch (error) {
      console.error('Auth check error:', error)
      return false
    }
  }
}