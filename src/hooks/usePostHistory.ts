import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { HistoryItem, InputMode, SourceInfo, JobConfig } from '../types/history'
import type { Tone, Style, Language } from './usePostGenerator'
import type { Database } from '../types/database'

type PostInsert = Database['public']['Tables']['posts']['Insert']

// Simple interface for Supabase post rows (response from DB)
interface PostRow {
  id: string
  user_id: string
  mode: string
  topic: string | null
  url: string | null
  source: unknown
  job_config: unknown
  tone: string
  style: string
  language: string
  content: string
  char_count: number | null
  created_at: string
}

// Helper to get supabase client
function getClient() {
  return supabase
}

const STORAGE_KEY = 'linkedin-post-history'
const MAX_ENTRIES = 50

function loadFromStorage(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const items = JSON.parse(stored) as HistoryItem[]
      // Migration: add default mode and language for old entries
      return items.map(item => ({
        ...item,
        mode: item.mode || 'topic',
        language: item.language || 'de',
      }))
    }
  } catch {
    console.error('Failed to load history from localStorage')
  }
  return []
}

function saveToStorage(history: HistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    console.error('Failed to save history to localStorage')
  }
}

function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    console.error('Failed to clear localStorage')
  }
}

export function usePostHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const previousUserIdRef = useRef<string | null>(null)
  const hasMergedRef = useRef(false)

  // Helper to transform PostRow to HistoryItem
  const transformPost = useCallback((post: PostRow): HistoryItem => ({
    id: post.id,
    user_id: post.user_id,
    mode: post.mode as InputMode,
    topic: post.topic || '',
    url: post.url || undefined,
    source: post.source as SourceInfo | undefined,
    jobConfig: post.job_config as JobConfig | undefined,
    tone: post.tone as Tone,
    style: post.style as Style,
    language: (post.language || 'de') as Language,
    content: post.content,
    createdAt: post.created_at,
    charCount: post.char_count || post.content.length,
  }), [])

  // Load history based on auth state
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)

      const client = getClient()
      if (user && client) {
        // User is logged in - load from Supabase
        try {
          const { data, error } = await client
            .from('posts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(MAX_ENTRIES)

          if (error) {
            console.error('Error loading posts from Supabase:', error)
            setHistory(loadFromStorage())
          } else {
            // Transform Supabase data to HistoryItem format
            const items: HistoryItem[] = (data || []).map(transformPost)

            // Check if we need to merge localStorage items (first login)
            if (!hasMergedRef.current && previousUserIdRef.current === null) {
              const localItems = loadFromStorage()
              if (localItems.length > 0) {
                // Upload local items to Supabase
                await mergeLocalToCloud(user.id, localItems, items)
                hasMergedRef.current = true
                clearLocalStorage()
                // Reload from Supabase after merge
                const { data: refreshedData } = await client
                  .from('posts')
                  .select('*')
                  .eq('user_id', user.id)
                  .order('created_at', { ascending: false })
                  .limit(MAX_ENTRIES)

                if (refreshedData) {
                  setHistory(refreshedData.map(transformPost))
                } else {
                  setHistory(items)
                }
              } else {
                setHistory(items)
              }
            } else {
              setHistory(items)
            }
          }
        } catch (err) {
          console.error('Error loading posts:', err)
          setHistory(loadFromStorage())
        }
      } else {
        // User is not logged in - use localStorage
        setHistory(loadFromStorage())
        hasMergedRef.current = false
      }

      previousUserIdRef.current = user?.id || null
      setLoading(false)
    }

    loadHistory()
  }, [user, transformPost])

  // Save to localStorage when history changes (only if not logged in)
  useEffect(() => {
    if (!user && !loading) {
      saveToStorage(history)
    }
  }, [history, user, loading])

  const mergeLocalToCloud = async (
    userId: string,
    localItems: HistoryItem[],
    cloudItems: HistoryItem[]
  ) => {
    const client = getClient()
    if (!client) return

    // Create a Set of existing content hashes to avoid duplicates
    const existingHashes = new Set(
      cloudItems.map(item => hashContent(item.content))
    )

    // Filter out duplicates
    const itemsToUpload = localItems.filter(
      item => !existingHashes.has(hashContent(item.content))
    )

    if (itemsToUpload.length === 0) return

    // Upload new items - convert undefined to null for database compatibility
    const postsToInsert: PostInsert[] = itemsToUpload.map(item => ({
      user_id: userId,
      mode: item.mode,
      topic: item.topic || null,
      url: item.url ?? null,
      source: item.source ?? null,
      job_config: item.jobConfig ?? null,
      tone: item.tone,
      style: item.style,
      language: item.language,
      content: item.content,
      char_count: item.charCount,
      created_at: item.createdAt,
    }))

    // Type assertion needed due to Supabase client generic inference issue
    // The postsToInsert type matches PostInsert[] which is the correct insert type
    const { error } = await client.from('posts').insert(postsToInsert as never[])

    if (error) {
      console.error('Error merging local items to cloud:', error)
    }
  }

  const addToHistory = useCallback(async (item: {
    mode: InputMode
    topic: string
    url?: string
    source?: SourceInfo
    jobConfig?: JobConfig
    tone: Tone
    style: Style
    language: Language
    content: string
  }) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      user_id: user?.id,
      mode: item.mode,
      topic: item.topic,
      url: item.url,
      source: item.source,
      jobConfig: item.jobConfig,
      tone: item.tone,
      style: item.style,
      language: item.language,
      content: item.content,
      createdAt: new Date().toISOString(),
      charCount: item.content.length,
    }

    // Optimistic update
    setHistory(prev => {
      const updated = [newItem, ...prev]
      if (updated.length > MAX_ENTRIES) {
        return updated.slice(0, MAX_ENTRIES)
      }
      return updated
    })

    // If logged in, save to Supabase
    const client = getClient()
    if (user && client) {
      // Convert undefined to null for database compatibility
      const postToInsert: PostInsert = {
        user_id: user.id,
        mode: item.mode,
        topic: item.topic || null,
        url: item.url ?? null,
        source: item.source ?? null,
        job_config: item.jobConfig ?? null,
        tone: item.tone,
        style: item.style,
        language: item.language,
        content: item.content,
        char_count: item.content.length,
      }

      // Type assertion needed due to Supabase client generic inference issue
      const { data, error } = await client
        .from('posts')
        .insert(postToInsert as never)
        .select()
        .single()

      if (error) {
        console.error('Error saving post to Supabase:', error)
        // Rollback optimistic update on error
        setHistory(prev => prev.filter(h => h.id !== newItem.id))
      } else if (data) {
        // Update the item with the Supabase-generated ID
        const postData = data as PostRow
        setHistory(prev =>
          prev.map(h => h.id === newItem.id ? { ...h, id: postData.id } : h)
        )
      }
    }
  }, [user])

  const removeFromHistory = useCallback(async (id: string) => {
    // Optimistic update
    setHistory(prev => prev.filter(item => item.id !== id))

    // If logged in, delete from Supabase
    const client = getClient()
    if (user && client) {
      const { error } = await client
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting post from Supabase:', error)
      }
    }
  }, [user])

  const clearHistory = useCallback(async () => {
    // Optimistic update
    setHistory([])

    // If logged in, delete all from Supabase
    const client = getClient()
    if (user && client) {
      const { error } = await client
        .from('posts')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Error clearing posts from Supabase:', error)
      }
    }
  }, [user])

  return {
    history,
    loading,
    addToHistory,
    removeFromHistory,
    clearHistory,
  }
}

// Simple hash function for content deduplication
function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & 0x7fffffff // Convert to positive 32bit integer
  }
  return hash.toString(16)
}
