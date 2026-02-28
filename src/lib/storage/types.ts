import type { HistoryItem } from '../../types/history'
import type { InputMode, Tone, Style, Language, SerializedPostVersion, StoryPoint } from '../../types/post'
import type { JobConfig } from '../../types/job'
import type { SourceInfo } from '../../types/source'

export interface NewHistoryItem {
  mode: InputMode
  topic: string
  url?: string
  source?: SourceInfo
  jobConfig?: JobConfig
  tone: Tone
  style: Style
  language: Language
  content: string
  versions?: SerializedPostVersion[]
  storyPoints?: StoryPoint[]
}

export interface HistoryItemUpdate {
  content?: string
  charCount?: number
  versions?: SerializedPostVersion[]
}

export interface StorageAdapter {
  loadHistory(limit?: number): Promise<HistoryItem[]>
  addItem(userId: string | undefined, item: NewHistoryItem): Promise<HistoryItem | null>
  updateItem(userId: string | undefined, id: string, updates: HistoryItemUpdate): Promise<void>
  removeItem(userId: string | undefined, id: string): Promise<void>
  clearAll(userId: string | undefined): Promise<void>
}
