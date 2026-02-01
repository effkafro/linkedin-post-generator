import { useState, useEffect, useCallback } from 'react'
import type { HistoryItem, InputMode, SourceInfo } from '../types/history'
import type { Tone, Style, Language } from './usePostGenerator'

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

export function usePostHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => loadFromStorage())

  useEffect(() => {
    saveToStorage(history)
  }, [history])

  const addToHistory = useCallback((item: {
    mode: InputMode
    topic: string
    url?: string
    source?: SourceInfo
    tone: Tone
    style: Style
    language: Language
    content: string
  }) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      mode: item.mode,
      topic: item.topic,
      url: item.url,
      source: item.source,
      tone: item.tone,
      style: item.style,
      language: item.language,
      content: item.content,
      createdAt: new Date().toISOString(),
      charCount: item.content.length,
    }

    setHistory(prev => {
      const updated = [newItem, ...prev]
      if (updated.length > MAX_ENTRIES) {
        return updated.slice(0, MAX_ENTRIES)
      }
      return updated
    })
  }, [])

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  }
}
