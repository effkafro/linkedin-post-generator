import type { Language } from './post'

export interface VoiceProfile {
  id: string
  user_id: string
  // Identity
  full_name: string
  job_title: string
  company: string
  industry: string
  bio: string
  // Voice
  expertise_topics: string[]
  tone_preferences: string[]
  target_audience: string
  personal_values: string[]
  positioning_statement: string
  // Preferences
  preferred_language: Language
  preferred_emojis: 'none' | 'minimal' | 'moderate'
  hashtag_style: 'branded' | 'trending' | 'niche'
  default_cta_style: string
  created_at: string
  updated_at: string
}

export interface ExamplePost {
  id: string
  profile_id: string
  content: string
  platform: 'linkedin'
  performance_notes?: string
  created_at: string
}
