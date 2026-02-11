import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { AuthError } from '@supabase/supabase-js'
import type { User, Session } from '@supabase/supabase-js'
import type { Plan } from '../types/database'

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  plan: Plan
  posts_this_month: number
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: 'google' | 'linkedin_oidc') => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrCreateProfile = useCallback(async (user: User) => {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) return data as Profile

    // Profile doesn't exist yet — create it
    if (error && error.code === 'PGRST116') {
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email ?? null,
          full_name: (user.user_metadata?.full_name as string) ?? null,
          avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
        } as never)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating profile:', insertError)
        return null
      }
      return created as unknown as Profile
    }

    console.error('Error fetching profile:', error)
    return null
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const profileData = await fetchOrCreateProfile(user)
    setProfile(profileData)
  }, [user, fetchOrCreateProfile])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // onAuthStateChange fires INITIAL_SESSION on mount — single source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Defer profile fetch to avoid blocking auth state updates
          // Use setTimeout to avoid Supabase deadlock on token refresh
          setTimeout(() => {
            fetchOrCreateProfile(session.user).then(setProfile)
          }, 0)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchOrCreateProfile])

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return { error: new AuthError('Supabase not configured') }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName?: string): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return { error: new AuthError('Supabase not configured') }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    return { error }
  }, [])

  const signInWithOAuth = useCallback(async (provider: 'google' | 'linkedin_oidc'): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return { error: new AuthError('Supabase not configured') }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    })

    return { error }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
