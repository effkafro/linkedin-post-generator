import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { VoiceProfile, ExamplePost } from '../types/profile'

interface UseProfileReturn {
  profile: VoiceProfile | null
  examplePosts: ExamplePost[]
  loading: boolean
  saving: boolean
  updateProfile: (updates: Partial<VoiceProfile>) => Promise<void>
  addExamplePost: (content: string, performanceNotes?: string) => Promise<void>
  removeExamplePost: (id: string) => Promise<void>
  completeness: number
}

const PROFILE_FIELDS: (keyof VoiceProfile)[] = [
  'full_name', 'job_title', 'company', 'industry', 'bio',
  'expertise_topics', 'tone_preferences', 'target_audience',
  'personal_values', 'positioning_statement',
]

function calculateCompleteness(profile: VoiceProfile | null): number {
  if (!profile) return 0
  let filled = 0
  for (const field of PROFILE_FIELDS) {
    const val = profile[field]
    if (Array.isArray(val) ? val.length > 0 : !!val) filled++
  }
  return Math.round((filled / PROFILE_FIELDS.length) * 100)
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth()
  const [profile, setProfile] = useState<VoiceProfile | null>(null)
  const [examplePosts, setExamplePosts] = useState<ExamplePost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load profile
  useEffect(() => {
    if (!user || !supabase) {
      setProfile(null)
      setExamplePosts([])
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      const client = supabase!
      const { data: profileData } = await client
        .from('voice_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileData) {
        setProfile(profileData as unknown as VoiceProfile)

        const { data: posts } = await client
          .from('example_posts')
          .select('*')
          .eq('profile_id', (profileData as unknown as VoiceProfile).id)
          .order('created_at', { ascending: false })

        setExamplePosts((posts || []) as unknown as ExamplePost[])
      }
      setLoading(false)
    }

    load()
  }, [user])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingUpdatesRef = useRef<Partial<VoiceProfile>>({})
  const profileIdRef = useRef<string | null>(null)

  // Keep profileId ref in sync for the unmount cleanup
  useEffect(() => {
    profileIdRef.current = profile?.id ?? null
  }, [profile?.id])

  const updateProfile = useCallback(async (updates: Partial<VoiceProfile>) => {
    if (!user || !supabase) return

    if (profile) {
      // Optimistic local update - no saving/disabled state
      setProfile(prev => prev ? { ...prev, ...updates } : prev)

      // Accumulate pending updates and debounce the DB write
      pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        const pending = pendingUpdatesRef.current
        pendingUpdatesRef.current = {}
        setSaving(true)
        try {
          await supabase!
            .from('voice_profiles')
            .update({ ...pending, updated_at: new Date().toISOString() } as never)
            .eq('id', profile.id)
        } catch (err) {
          console.error('Error saving profile:', err)
        } finally {
          setSaving(false)
        }
      }, 500)
    } else {
      // Create new profile - this needs to be immediate
      setSaving(true)
      try {
        const newProfile = {
          user_id: user.id,
          full_name: '',
          job_title: '',
          company: '',
          industry: '',
          bio: '',
          expertise_topics: [],
          tone_preferences: [],
          target_audience: '',
          personal_values: [],
          positioning_statement: '',
          preferred_language: 'de',
          preferred_emojis: 'minimal',
          hashtag_style: 'niche',
          default_cta_style: '',
          ...updates,
        }

        const { data } = await supabase
          .from('voice_profiles')
          .insert(newProfile as never)
          .select()
          .single()

        if (data) {
          setProfile(data as unknown as VoiceProfile)
        }
      } catch (err) {
        console.error('Error creating profile:', err)
      } finally {
        setSaving(false)
      }
    }
  }, [user, profile])

  // Flush pending updates only on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        const pending = pendingUpdatesRef.current
        const id = profileIdRef.current
        if (id && Object.keys(pending).length > 0 && supabase) {
          supabase
            .from('voice_profiles')
            .update({ ...pending, updated_at: new Date().toISOString() } as never)
            .eq('id', id)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addExamplePost = useCallback(async (content: string, performanceNotes?: string) => {
    if (!profile || !supabase) return

    const { data } = await supabase
      .from('example_posts')
      .insert({
        profile_id: profile.id,
        content,
        platform: 'linkedin',
        performance_notes: performanceNotes || null,
      } as never)
      .select()
      .single()

    if (data) {
      setExamplePosts(prev => [data as unknown as ExamplePost, ...prev])
    }
  }, [profile])

  const removeExamplePost = useCallback(async (id: string) => {
    if (!supabase) return

    setExamplePosts(prev => prev.filter(p => p.id !== id))
    await supabase.from('example_posts').delete().eq('id', id)
  }, [])

  return {
    profile,
    examplePosts,
    loading,
    saving,
    updateProfile,
    addExamplePost,
    removeExamplePost,
    completeness: calculateCompleteness(profile),
  }
}
