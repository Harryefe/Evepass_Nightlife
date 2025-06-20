import { supabase, isSupabaseConfigured } from './supabase'
import * as Sentry from '@sentry/nextjs'

export interface AuthUser {
  id: string
  email: string
  user_type: 'customer' | 'business'
  profile: any | null
}

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string, userData: any) {
    return Sentry.startSpan(
      {
        op: "auth.signup",
        name: "User Registration",
      },
      async (span) => {
        try {
          // Check if Supabase is configured
          if (!isSupabaseConfigured()) {
            throw new Error('Database connection not configured. Please check your environment variables.');
          }

          span.setAttribute("user_type", userData.user_type);
          span.setAttribute("email", email);

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
            Sentry.captureException(authError)
            throw authError
          }

          if (!authData.user) {
            const error = new Error('User creation failed - no user returned')
            Sentry.captureException(error)
            throw error
          }

          console.log('Auth user created:', authData.user.id)
          span.setAttribute("user_id", authData.user.id);

          // Wait for auth state to be established
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Verify session is established by checking multiple times
          let sessionAttempts = 0
          let session = null
          
          while (sessionAttempts < 5 && !session) {
            const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError) {
              console.error('Session check error:', sessionError)
              Sentry.captureException(sessionError)
            }
            
            if (currentSession && currentSession.user.id === authData.user.id) {
              session = currentSession
              break
            }
            
            sessionAttempts++
            console.log(`Session attempt ${sessionAttempts}/5...`)
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          if (!session) {
            const error = new Error('Failed to establish authenticated session after multiple attempts')
            Sentry.captureException(error)
            throw error
          }

          console.log('Session verified successfully, proceeding with profile creation')

          // Prepare profile data with explicit user ID
          const profileData = {
            id: authData.user.id,
            email: email,
            user_type: userData.user_type,
            ...userData
          }

          console.log('Creating profile with data:', profileData)

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
                
                console.log('Customer profile created:', profileResult)
                profileCreated = true
              } else if (userData.user_type === 'business') {
                const { data: profileResult, error: profileError } = await supabase
                  .from('businesses')
                  .insert(profileData)
                  .select()
                
                if (profileError) {
                  throw profileError
                }
                
                console.log('Business profile created:', profileResult)
                profileCreated = true
              }
            } catch (profileError: any) {
              profileAttempts++
              console.error(`Profile creation attempt ${profileAttempts}/3 failed:`, profileError)
              Sentry.captureException(profileError)
              
              if (profileAttempts >= 3) {
                // Clean up auth user if all profile creation attempts fail
                try {
                  await supabase.auth.signOut()
                } catch (cleanupError) {
                  console.error('Cleanup error:', cleanupError)
                  Sentry.captureException(cleanupError)
                }
                throw new Error(`Failed to create ${userData.user_type} profile after ${profileAttempts} attempts: ${profileError.message}`)
              }
              
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }

          span.setAttribute("signup_success", true);
          return authData
        } catch (error) {
          console.error('Complete signup error:', error)
          span.setAttribute("signup_success", false);
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Sign in user with improved error handling
  async signIn(email: string, password: string) {
    return Sentry.startSpan(
      {
        op: "auth.signin",
        name: "User Sign In",
      },
      async (span) => {
        try {
          // Check if Supabase is configured first
          if (!isSupabaseConfigured()) {
            throw new Error('Database connection not configured. Please check your environment variables.');
          }

          span.setAttribute("email", email);
          console.log('Attempting sign in for:', email)

          // Attempt sign in directly without connection test
          // The connection test was causing the fetch error
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            console.error('Sign in error:', error)
            Sentry.captureException(error)
            
            // Provide more specific error messages
            if (error.message.includes('Invalid login credentials')) {
              throw new Error('Invalid email or password. Please check your credentials and try again.');
            } else if (error.message.includes('Email not confirmed')) {
              throw new Error('Please check your email and click the confirmation link before signing in.');
            } else if (error.message.includes('Too many requests')) {
              throw new Error('Too many sign-in attempts. Please wait a few minutes and try again.');
            } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
              throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
            } else if (error.message.includes('Invalid API key')) {
              throw new Error('Database configuration error. Please contact support.');
            }
            
            // For any other error, throw the original message
            throw error
          }

          if (!data.user) {
            const error = new Error('Sign in failed - no user returned')
            Sentry.captureException(error)
            throw error
          }

          console.log('Sign in successful for user:', data.user.id)
          span.setAttribute("user_id", data.user.id);

          // Verify session is established with timeout
          let sessionAttempts = 0
          let session = null
          
          while (sessionAttempts < 3 && !session) {
            try {
              const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
              
              if (sessionError) {
                console.error('Session verification error:', sessionError)
                Sentry.captureException(sessionError)
              }
              
              if (currentSession && currentSession.user.id === data.user.id) {
                session = currentSession
                break
              }
              
              sessionAttempts++
              await new Promise(resolve => setTimeout(resolve, 300))
            } catch (sessionCheckError) {
              console.error('Session check failed:', sessionCheckError)
              sessionAttempts++
            }
          }

          if (!session) {
            const error = new Error('Failed to establish authenticated session')
            Sentry.captureException(error)
            throw error
          }

          span.setAttribute("signin_success", true);
          return data
        } catch (error: any) {
          console.error('Sign in failed:', error)
          span.setAttribute("signin_success", false);
          Sentry.captureException(error)
          
          // Re-throw with original message if it's already user-friendly
          if (error.message && (
            error.message.includes('Unable to connect') ||
            error.message.includes('Invalid email') ||
            error.message.includes('Database configuration') ||
            error.message.includes('check your internet') ||
            error.message.includes('Too many requests') ||
            error.message.includes('Email not confirmed')
          )) {
            throw error
          }
          
          // Check for network-related errors
          if (error.message && (
            error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('ERR_NETWORK') ||
            error.message.includes('ERR_INTERNET_DISCONNECTED')
          )) {
            throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
          }
          
          // Default fallback error
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
        }
      }
    )
  },

  // Sign out user
  async signOut() {
    return Sentry.startSpan(
      {
        op: "auth.signout",
        name: "User Sign Out",
      },
      async () => {
        try {
          // Check if Supabase is configured
          if (!isSupabaseConfigured()) {
            throw new Error('Database connection not configured. Please check your environment variables.');
          }

          const { error } = await supabase.auth.signOut()
          if (error) {
            Sentry.captureException(error)
            throw error
          }
        } catch (error) {
          Sentry.captureException(error)
          throw error
        }
      }
    )
  },

  // Get current user with profile
  async getCurrentUser(): Promise<AuthUser | null> {
    return Sentry.startSpan(
      {
        op: "auth.getCurrentUser",
        name: "Get Current User",
      },
      async () => {
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
            Sentry.captureException(error)
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
          Sentry.captureException(error)
          return null
        }
      }
    )
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
      Sentry.captureException(error)
      return false
    }
  }
}