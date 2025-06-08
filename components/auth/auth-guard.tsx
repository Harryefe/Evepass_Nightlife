'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService, AuthUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  allowedUserTypes?: ('customer' | 'business')[]
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login',
  allowedUserTypes = ['customer', 'business']
}: AuthGuardProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)

        if (requireAuth && !currentUser) {
          router.push(redirectTo)
          return
        }

        if (currentUser && !allowedUserTypes.includes(currentUser.user_type)) {
          // Redirect based on user type
          const defaultRoute = currentUser.user_type === 'business' ? '/dashboard' : '/explore'
          router.push(defaultRoute)
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (requireAuth) {
          router.push(redirectTo)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        if (requireAuth) {
          router.push(redirectTo)
        }
      } else if (event === 'SIGNED_IN' && session) {
        // Wait a moment for the session to be fully established
        setTimeout(async () => {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        }, 500)
      }
    })

    return () => subscription.unsubscribe()
  }, [requireAuth, redirectTo, allowedUserTypes, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  return <>{children}</>
}