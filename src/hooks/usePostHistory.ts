import { useState, useEffect, useCallback } from 'react'
import type { HistoryItem } from '../types/history'
import type { Tone, Style } from './usePostGenerator'

const STORAGE_KEY = 'linkedin-post-history'
const MAX_ENTRIES = 50

function loadFromStorage(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
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
    topic: string
    tone: Tone
    style: Style
    content: string
  }) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      topic: item.topic,
      tone: item.tone,
      style: item.style,
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
