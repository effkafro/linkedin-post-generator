import type { HistoryItem } from '../../types/history'
import type { StorageAdapter, NewHistoryItem, HistoryItemUpdate } from './types'

const STORAGE_KEY = 'linkedin-post-history'
const MAX_ENTRIES = 50

function loadFromStorage(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const items = JSON.parse(stored) as HistoryItem[]
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

export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    console.error('Failed to clear localStorage')
  }
}

export const localStorageAdapter: StorageAdapter = {
  async loadHistory(): Promise<HistoryItem[]> {
    return loadFromStorage()
  },

  async addItem(_userId: string | undefined, item: NewHistoryItem): Promise<HistoryItem> {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
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
      storyPoints: item.storyPoints,
    }

    const current = loadFromStorage()
    const updated = [newItem, ...current].slice(0, MAX_ENTRIES)
    saveToStorage(updated)

    return newItem
  },

  async updateItem(_userId: string | undefined, id: string, updates: HistoryItemUpdate): Promise<void> {
    const current = loadFromStorage()
    const updated = current.map(item => {
      if (item.id !== id) return item
      return {
        ...item,
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.charCount !== undefined && { charCount: updates.charCount }),
        ...(updates.versions !== undefined && { versions: updates.versions }),
      }
    })
    saveToStorage(updated)
  },

  async removeItem(_userId: string | undefined, id: string): Promise<void> {
    const current = loadFromStorage()
    saveToStorage(current.filter(item => item.id !== id))
  },

  async clearAll(): Promise<void> {
    clearLocalStorage()
  },
}
