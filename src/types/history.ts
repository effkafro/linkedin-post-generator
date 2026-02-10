import type { Tone, Style, Language, RefineAction } from '../hooks/usePostGenerator'
import type { JobConfig, SourceInfo } from './database'

export type InputMode = 'topic' | 'url' | 'job'

export type { SourceInfo, JobConfig }
export type { JobSubStyle, CandidatePersona, Industry } from './database'

export interface SerializedPostVersion {
  id: string
  content: string
  timestamp: string // ISO string
  action: 'generate' | RefineAction
  source?: SourceInfo
}

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
