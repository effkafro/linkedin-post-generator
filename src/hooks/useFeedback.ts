import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { FeedbackType, FeedbackCategory } from '../types/feedback'

interface SubmitParams {
  type: FeedbackType
  category: FeedbackCategory | null
  title: string
  description: string
}

interface UseFeedbackReturn {
  loading: boolean
  error: string | null
  success: boolean
  submitFeedback: (params: SubmitParams) => Promise<boolean>
  reset: () => void
}

export function useFeedback(): UseFeedbackReturn {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submitFeedback = useCallback(async (params: SubmitParams): Promise<boolean> => {
    if (!user || !supabase) {
      setError('Du musst angemeldet sein, um Feedback zu senden.')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error: dbError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          type: params.type,
          category: params.category,
          title: params.title,
          description: params.description,
        } as never)

      if (dbError) {
        setError('Feedback konnte nicht gespeichert werden. Bitte versuche es erneut.')
        return false
      }

      setSuccess(true)
      return true
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.')
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setSuccess(false)
  }, [])

  return { loading, error, success, submitFeedback, reset }
}
