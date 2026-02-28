import type { SourceInfo } from './source'

export type InputMode = 'topic' | 'url' | 'job'
export type Tone = 'professional' | 'casual' | 'inspirational' | 'educational'
export type Style = 'story' | 'listicle' | 'question-hook' | 'bold-statement'
export type Language = 'de' | 'en' | 'fr' | 'es' | 'it'
export type RefineAction = 'shorter' | 'longer' | 'formal' | 'casual' | 'custom'
export type TopicInputMode = 'simple' | 'storyline'

export interface StoryPoint {
  label: string
  content: string
}

export interface PostVersion {
  id: string
  content: string
  timestamp: Date
  action: 'generate' | RefineAction
  source?: SourceInfo
}

export interface SerializedPostVersion {
  id: string
  content: string
  timestamp: string // ISO string
  action: 'generate' | RefineAction
  source?: SourceInfo
}
