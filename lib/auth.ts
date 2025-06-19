import { supabase, isSupabaseConfigured } from './supabase'

export interface AuthUser {
  id: string
  email: string
  user_type: 'customer' | 'business'
  profile: any | null
}

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, userData: any) {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured. Please check your environment variables.');
      }

      console.log('Starting signup process for:', email, 'Type:', userData.user_type)
      
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userData.user_type,
            email: email
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned')
      }

      console.log('Auth user created:', authData.user.id)

      // Wait longer for auth state to be established and session to be available
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Verify we have a valid session before proceeding
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('Session verification failed:', sessionError)
        throw new Error('Failed to establish authenticated session')
      }

      console.log('Session verified, proceeding with profile creation')

      // Prepare profile data with explicit user ID
      const profileData = {
        id: authData.user.id,
        email: email,
        user_type: userData.user_type,
        ...userData
      }

      console.log('Creating profile with data:', profileData)

      // Create profile in appropriate table using the authenticated session
      if (userData.user_type === 'customer') {
        // Use the service role for profile creation to bypass RLS temporarily
        const { data: profileResult, error: profileError } = await supabase
          .from('customers')
          .insert(profileData)
          .select()
        
        if (profileError) {
          console.error('Customer profile creation error:', profileError)
          
          // If it's an RLS error, try with a direct insert using the session
          if (profileError.message.includes('row-level security')) {
            console.log('Retrying profile creation with session context...')
            
            // Wait a bit more and try again
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const { data: retryResult, error: retryError } = await supabase
              .from('customers')
              .insert(profileData)
              .select()
            
            if (retryError) {
              console.error('Retry failed:', retryError)
              // Clean up auth user if profile creation fails
              try {
                await supabase.auth.signOut()
              } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError)
              }
              throw new Error(`Failed to create customer profile: ${retryError.message}`)
            }
            
            console.log('Customer profile created on retry:', retryResult)
          } else {
            // Clean up auth user if profile creation fails
            try {
              await supabase.auth.signOut()
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError)
            }
            throw new Error(`Failed to create customer profile: ${profileError.message}`)
          }
        } else {
          console.log('Customer profile created:', profileResult)
        }
      } else if (userData.user_type === 'business') {
        const { data: profileResult, error: profileError } = await supabase
          .from('businesses')
          .insert(profileData)
          .select()
        
        if (profileError) {
          console.error('Business profile creation error:', profileError)
          
          // If it's an RLS error, try with a direct insert using the session
          if (profileError.message.includes('row-level security')) {
            console.log('Retrying business profile creation with session context...')
            
            // Wait a bit more and try again
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const { data: retryResult, error: retryError } = await supabase
              .from('businesses')
              .insert(profileData)
              .select()
            
            if (retryError) {
              console.error('Business retry failed:', retryError)
              // Clean up auth user if profile creation fails
              try {
                await supabase.auth.signOut()
              } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError)
              }
              throw new Error(`Failed to create business profile: ${retryError.message}`)
            }
            
            console.log('Business profile created on retry:', retryResult)
          } else {
            // Clean up auth user if profile creation fails
            try {
              await supabase.auth.signOut()
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError)
            }
            throw new Error(`Failed to create business profile: ${profileError.message}`)
          }
        } else {
          console.log('Business profile created:', profileResult)
        }
      }

      return authData
    } catch (error) {
      console.error('Complete signup error:', error)
      throw error
    }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured. Please check your environment variables.');
      }

      console.log('Attempting sign in for:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('Sign in failed - no user returned')
      }

      console.log('Sign in successful for user:', data.user.id)

      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500))

      return data
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  },

  // Sign out user
  async signOut() {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      throw new Error('Database connection not configured. Please check your environment variables.');
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user with profile
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        return null
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      const userType = user.user_metadata?.user_type || 'customer'
      const tableName = userType === 'customer' ? 'customers' : 'businesses'
      
      const { data: profile, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error)
        // Return user with null profile if profile fetch fails
        return {
          id: user.id,
          email: user.email!,
          user_type: userType,
          profile: null
        }
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
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        return false
      }

      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch (error) {
      console.error('Auth check error:', error)
      return false
    }
  }
}