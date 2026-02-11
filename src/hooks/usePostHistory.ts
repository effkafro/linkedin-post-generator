import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { HistoryItem } from '../types/history'
import type { SerializedPostVersion } from '../types/post'
import type { NewHistoryItem } from '../lib/storage/types'
import { localStorageAdapter, clearLocalStorage } from '../lib/storage/localStorageAdapter'
import { supabaseStorageAdapter } from '../lib/storage/supabaseStorageAdapter'
import { hashContent } from '../utils/hashContent'

export function usePostHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const previousUserIdRef = useRef<string | null>(null)
  const hasMergedRef = useRef(false)

  const adapter = user ? supabaseStorageAdapter : localStorageAdapter

  // Load history based on auth state
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)

      try {
        if (user) {
          const cloudItems = await supabaseStorageAdapter.loadHistory()

          // Check if we need to merge localStorage items (first login)
          if (!hasMergedRef.current && previousUserIdRef.current === null) {
            const localItems = await localStorageAdapter.loadHistory()
            if (localItems.length > 0) {
              await mergeLocalToCloud(user.id, localItems, cloudItems)
              hasMergedRef.current = true
              clearLocalStorage()
              // Reload after merge
              const refreshed = await supabaseStorageAdapter.loadHistory()
              setHistory(refreshed)
            } else {
              setHistory(cloudItems)
            }
          } else {
            setHistory(cloudItems)
          }
        } else {
          const items = await localStorageAdapter.loadHistory()
          setHistory(items)
          hasMergedRef.current = false
        }
      } catch (err) {
        console.error('Error loading history:', err)
        const fallback = await localStorageAdapter.loadHistory()
        setHistory(fallback)
      }

      previousUserIdRef.current = user?.id || null
      setLoading(false)
    }

    loadHistory()
  }, [user])

  // Save to localStorage when history changes (only if not logged in)
  useEffect(() => {
    if (!user && !loading && history.length > 0) {
      try {
        localStorage.setItem('linkedin-post-history', JSON.stringify(history))
      } catch {
        // handled by adapter
      }
    }
  }, [history, user, loading])

  const mergeLocalToCloud = async (userId: string, localItems: HistoryItem[], cloudItems: HistoryItem[]) => {
    const existingHashes = new Set(cloudItems.map(item => hashContent(item.content)))
    const itemsToUpload = localItems.filter(item => !existingHashes.has(hashContent(item.content)))

    for (const item of itemsToUpload) {
      await supabaseStorageAdapter.addItem(userId, {
        mode: item.mode,
        topic: item.topic,
        url: item.url,
        source: item.source,
        jobConfig: item.jobConfig,
        tone: item.tone,
        style: item.style,
        language: item.language,
        content: item.content,
        versions: item.versions,
      })
    }
  }

  const addToHistory = useCallback(async (item: NewHistoryItem): Promise<HistoryItem | null> => {
    // Create optimistic item
    const optimisticItem: HistoryItem = {
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
      versions: item.versions,
    }

    // Optimistic update
    setHistory(prev => [optimisticItem, ...prev].slice(0, 50))

    if (user) {
      const savedItem = await adapter.addItem(user.id, item)
      if (savedItem) {
        // Replace optimistic with real item
        setHistory(prev => prev.map(h => h.id === optimisticItem.id ? savedItem : h))
        return savedItem
      } else {
        // Rollback
        setHistory(prev => prev.filter(h => h.id !== optimisticItem.id))
        return null
      }
    }

    return optimisticItem
  }, [user, adapter])

  const updateHistoryItem = useCallback(async (id: string, updates: {
    content?: string
    charCount?: number
    versions?: SerializedPostVersion[]
  }) => {
    // Optimistic update
    setHistory(prev => prev.map(item => {
      if (item.id !== id) return item
      return {
        ...item,
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.charCount !== undefined && { charCount: updates.charCount }),
        ...(updates.versions !== undefined && { versions: updates.versions }),
      }
    }))

    await adapter.updateItem(user?.id, id, updates)
  }, [user, adapter])

  const removeFromHistory = useCallback(async (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
    await adapter.removeItem(user?.id, id)
  }, [user, adapter])

  const clearHistory = useCallback(async () => {
    setHistory([])
    await adapter.clearAll(user?.id)
  }, [user, adapter])

  return {
    history,
    loading,
    addToHistory,
    updateHistoryItem,
    removeFromHistory,
    clearHistory,
  }
}
