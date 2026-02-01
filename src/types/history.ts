import type { Tone, Style, Language } from '../hooks/usePostGenerator'

export type InputMode = 'topic' | 'url'

export interface SourceInfo {
  title: string
  excerpt: string
  url: string
}

export interface HistoryItem {
  id: string
  mode: InputMode
  topic: string
  url?: string
  source?: SourceInfo
  tone: Tone
  style: Style
  language: Language
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
