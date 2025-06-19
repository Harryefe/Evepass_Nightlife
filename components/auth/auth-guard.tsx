'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService, AuthUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import * as Sentry from '@sentry/nextjs'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  allowedUserTypes?: ('customer' | 'business')[]
  strictBusinessAccess?: boolean // New prop for strict business access
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login',
  allowedUserTypes = ['customer', 'business'],
  strictBusinessAccess = false
}: AuthGuardProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      return Sentry.startSpan(
        {
          op: "auth.guard",
          name: "Auth Guard Check",
        },
        async (span) => {
          try {
            const currentUser = await authService.getCurrentUser()
            setUser(currentUser)
            
            span.setAttribute("user_authenticated", !!currentUser);
            span.setAttribute("user_type", currentUser?.user_type || "none");
            span.setAttribute("strict_business_access", strictBusinessAccess);

            if (requireAuth && !currentUser) {
              span.setAttribute("redirect_reason", "not_authenticated");
              router.push(redirectTo)
              return
            }

            if (currentUser) {
              // Check if user type is allowed
              if (!allowedUserTypes.includes(currentUser.user_type)) {
                span.setAttribute("redirect_reason", "user_type_not_allowed");
                const defaultRoute = currentUser.user_type === 'business' ? '/dashboard' : '/explore'
                router.push(defaultRoute)
                return
              }

              // Strict business access control
              if (strictBusinessAccess && currentUser.user_type !== 'business') {
                span.setAttribute("access_denied", true);
                setAccessDenied(true)
                return
              }
            }

            span.setAttribute("access_granted", true);
          } catch (error) {
            console.error('Auth check failed:', error)
            Sentry.captureException(error)
            span.setAttribute("auth_check_failed", true);
            
            if (requireAuth) {
              router.push(redirectTo)
            }
          } finally {
            setLoading(false)
          }
        }
      )
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setAccessDenied(false)
        if (requireAuth) {
          router.push(redirectTo)
        }
      } else if (event === 'SIGNED_IN' && session) {
        // Wait a moment for the session to be fully established
        setTimeout(async () => {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          
          // Re-check access after sign in
          if (strictBusinessAccess && currentUser?.user_type !== 'business') {
            setAccessDenied(true)
          } else {
            setAccessDenied(false)
          }
        }, 500)
      }
    })

    return () => subscription.unsubscribe()
  }, [requireAuth, redirectTo, allowedUserTypes, strictBusinessAccess, router])

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

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
            <p className="text-muted-foreground mb-6">
              This area is exclusively for business owners. Please sign in with a business account to access the dashboard.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Sign In as Business Owner
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="w-full border border-border text-foreground px-4 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Continue as Customer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  return <>{children}</>
}