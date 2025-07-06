'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Create or update user record in our database via API route
  const upsertUserRecord = async (authUser: User, sessionToken: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({
          userData: {
            id: authUser.id,
            email: authUser.email || '',
            firstName: authUser.user_metadata?.firstName || '',
            lastName: authUser.user_metadata?.lastName || '',
            profileImageUrl: authUser.user_metadata?.avatar_url || '',
          }
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('User record updated successfully via API', data)
      } else {
        const errorData = await response.json()
        console.error('Error upserting user record:', response.status, errorData)
      }
    } catch (error) {
      console.error('Exception upserting user record:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else if (session) {
          setSession(session)
          setUser(session.user)
          
          // Create/update user record with session token
          await upsertUserRecord(session.user, session.access_token)
        }
      } catch (error) {
        console.error('Session initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session) {
        // Create/update user record with session token
        await upsertUserRecord(session.user, session.access_token)
        
        // Only redirect if we're on an auth page
        if (window.location.pathname.startsWith('/auth')) {
          router.push('/')
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear any stale data
        setUser(null)
        setSession(null)
        
        // Only redirect if we're not already on auth page
        if (!window.location.pathname.startsWith('/auth')) {
          router.push('/auth/login')
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Update user record when token is refreshed
        await upsertUserRecord(session.user, session.access_token)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
      }
      
      // Clear local state
      setUser(null)
      setSession(null)
      
      // Navigate to login
      router.push('/auth/login')
      
    } catch (error) {
      console.error('Exception during sign out:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Error refreshing session:', error)
        // If refresh fails, sign out
        await signOut()
      } else if (session) {
        setSession(session)
        setUser(session.user)
        // Update user record with new token
        await upsertUserRecord(session.user, session.access_token)
      }
    } catch (error) {
      console.error('Exception refreshing session:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}