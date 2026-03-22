import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { generateFingerprint } from '../utils/fingerprint'
import { ANONYMOUS_ACTION_LIMIT } from '../constants/usageLimit'

interface UseUsageLimitReturn {
  actionsUsed: number
  actionsRemaining: number
  limitReached: boolean
  loading: boolean
  checkAndIncrement: () => Promise<boolean>
}

export function useUsageLimit(): UseUsageLimitReturn {
  const { user } = useAuth()
  const [actionsUsed, setActionsUsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const fingerprintRef = useRef<string | null>(null)

  // Load usage on mount or when auth changes
  useEffect(() => {
    if (user) {
      // Authenticated → no limit
      setActionsUsed(0)
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured) {
      // Dev mode → no limit
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadUsage() {
      try {
        const fp = await generateFingerprint()
        fingerprintRef.current = fp

        const supabase = getSupabase()
        if (!supabase) {
          setLoading(false)
          return
        }

        const { data } = await supabase
          .from('anonymous_usage')
          .select('actions_used')
          .eq('fingerprint', fp)
          .single()

        const row = data as { actions_used: number } | null
        if (!cancelled) {
          setActionsUsed(row?.actions_used ?? 0)
        }
      } catch {
        // Fail open: allow usage on error
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUsage()
    return () => { cancelled = true }
  }, [user])

  const checkAndIncrement = useCallback(async (): Promise<boolean> => {
    // Authenticated → always allowed
    if (user) return true

    // Supabase not configured → allow (dev mode)
    if (!isSupabaseConfigured) return true

    const supabase = getSupabase()
    if (!supabase) return true

    try {
      const fp = fingerprintRef.current ?? await generateFingerprint()
      fingerprintRef.current = fp

      // Read fresh count from DB (avoid race conditions)
      const { data: existing } = await supabase
        .from('anonymous_usage')
        .select('actions_used')
        .eq('fingerprint', fp)
        .single()

      const existingRow = existing as { actions_used: number } | null
      const currentCount = existingRow?.actions_used ?? 0

      if (currentCount >= ANONYMOUS_ACTION_LIMIT) {
        setActionsUsed(currentCount)
        return false
      }

      // Upsert with incremented count
      const newCount = currentCount + 1
      await supabase
        .from('anonymous_usage')
        .upsert(
          {
            fingerprint: fp,
            actions_used: newCount,
            last_action_at: new Date().toISOString(),
          } as never,
          { onConflict: 'fingerprint' }
        )

      setActionsUsed(newCount)
      return true
    } catch {
      // Fail open on error
      return true
    }
  }, [user])

  const limitReached = !user && actionsUsed >= ANONYMOUS_ACTION_LIMIT
  const actionsRemaining = user ? Infinity : Math.max(0, ANONYMOUS_ACTION_LIMIT - actionsUsed)

  return {
    actionsUsed,
    actionsRemaining,
    limitReached,
    loading,
    checkAndIncrement,
  }
}
