import type { InputMode, Tone, Style, Language, SerializedPostVersion } from './post'
import type { JobConfig } from './job'
import type { SourceInfo } from './source'

export type { InputMode, SourceInfo, JobConfig, SerializedPostVersion }

export interface HistoryItem {
  id: string
  user_id?: string
  mode: InputMode
  topic: string
  url?: string
  source?: SourceInfo
  jobConfig?: JobConfig
  tone: Tone
  style: Style
  language: Language
  content: string
  createdAt: string
  charCount: number
  versions?: SerializedPostVersion[]
}

export interface PostHistoryState {
  history: HistoryItem[]
  addToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt' | 'charCount'>) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
}
