import { supabase, isSupabaseConfigured } from './supabase'
import { logger, withSentryErrorHandling } from './sentry'

export interface AuthUser {
  id: string
  email: string
  user_type: 'customer' | 'business'
  profile: any | null
}

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, userData: any) {
    return withSentryErrorHandling(async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured. Please check your environment variables.');
      }

      logger.info('Starting signup process', { email, userType: userData.user_type })
      
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
        logger.error('Auth signup failed', { error: authError.message, email })
        throw authError
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned')
      }

      logger.info('Auth user created successfully', { userId: authData.user.id })

      // Wait for auth state to be established
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify session is established by checking multiple times
      let sessionAttempts = 0
      let session = null
      
      while (sessionAttempts < 5 && !session) {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          logger.error('Session check failed', { error: sessionError.message, attempt: sessionAttempts })
        }
        
        if (currentSession && currentSession.user.id === authData.user.id) {
          session = currentSession
          break
        }
        
        sessionAttempts++
        logger.debug(`Session verification attempt ${sessionAttempts}/5`)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      if (!session) {
        throw new Error('Failed to establish authenticated session after multiple attempts')
      }

      logger.info('Session verified successfully, proceeding with profile creation')

      // Prepare profile data with explicit user ID
      const profileData = {
        id: authData.user.id,
        email: email,
        user_type: userData.user_type,
        ...userData
      }

      // Create profile in appropriate table with retry logic
      let profileCreated = false
      let profileAttempts = 0
      
      while (!profileCreated && profileAttempts < 3) {
        try {
          if (userData.user_type === 'customer') {
            const { data: profileResult, error: profileError } = await supabase
              .from('customers')
              .insert(profileData)
              .select()
            
            if (profileError) {
              throw profileError
            }
            
            logger.info('Customer profile created successfully', { userId: authData.user.id })
            profileCreated = true
          } else if (userData.user_type === 'business') {
            const { data: profileResult, error: profileError } = await supabase
              .from('businesses')
              .insert(profileData)
              .select()
            
            if (profileError) {
              throw profileError
            }
            
            logger.info('Business profile created successfully', { userId: authData.user.id })
            profileCreated = true
          }
        } catch (profileError: any) {
          profileAttempts++
          logger.error(`Profile creation attempt ${profileAttempts}/3 failed`, {
            error: profileError.message,
            userId: authData.user.id,
            userType: userData.user_type
          })
          
          if (profileAttempts >= 3) {
            // Clean up auth user if all profile creation attempts fail
            try {
              await supabase.auth.signOut()
            } catch (cleanupError) {
              logger.error('Cleanup after profile creation failure failed', { error: cleanupError })
            }
            throw new Error(`Failed to create ${userData.user_type} profile after ${profileAttempts} attempts: ${profileError.message}`)
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      return authData
    }, 'User signup')
  },

  // Sign in user
  async signIn(email: string, password: string) {
    return withSentryErrorHandling(async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured. Please check your environment variables.');
      }

      logger.info('Attempting user sign in', { email })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        logger.error('Sign in failed', { error: error.message, email })
        throw error
      }

      if (!data.user) {
        throw new Error('Sign in failed - no user returned')
      }

      logger.info('Sign in successful', { userId: data.user.id })

      // Verify session is established
      let sessionAttempts = 0
      let session = null
      
      while (sessionAttempts < 3 && !session) {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          logger.error('Session verification failed', { error: sessionError.message })
        }
        
        if (currentSession && currentSession.user.id === data.user.id) {
          session = currentSession
          break
        }
        
        sessionAttempts++
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      if (!session) {
        throw new Error('Failed to establish authenticated session')
      }

      return data
    }, 'User sign in')
  },

  // Sign out user
  async signOut() {
    return withSentryErrorHandling(async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured. Please check your environment variables.');
      }

      const { error } = await supabase.auth.signOut()
      if (error) {
        logger.error('Sign out failed', { error: error.message })
        throw error
      }
      
      logger.info('User signed out successfully')
    }, 'User sign out')
  },

  // Get current user with profile
  async getCurrentUser(): Promise<AuthUser | null> {
    return withSentryErrorHandling(async () => {
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
        logger.error('Profile fetch failed', { error: error.message, userId: user.id })
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
    }, 'Get current user')
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
      logger.error('Auth check failed', { error })
      return false
    }
  }
}