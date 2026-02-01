import type { Tone, Style } from '../hooks/usePostGenerator'

export interface HistoryItem {
  id: string
  topic: string
  tone: Tone
  style: Style
  content: string
  createdAt: string
  charCount: number
}

export interface PostHistoryState {
  history: HistoryItem[]
  addToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt' | 'charCount'>) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
}
