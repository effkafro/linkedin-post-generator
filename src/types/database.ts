export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type JobSubStyle = 'wir-suchen' | 'kennt-jemanden' | 'persoenlich' | 'opportunity'
export type CandidatePersona = 'junior' | 'senior' | 'c-level' | 'freelancer'
export type Industry = 'tech' | 'finance' | 'healthcare' | 'marketing' | 'hr' | 'legal' | 'other'
export type Plan = 'free' | 'creator' | 'pro' | 'team' | 'agency'

export interface JobConfig {
  hasExistingPosting: boolean
  jobUrl?: string
  jobSubStyle: JobSubStyle
  candidatePersona: CandidatePersona
  industry: Industry
  location?: string
  remoteOption: boolean
  companyName?: string
  jobTitle?: string
  benefits?: string[]
  requirements?: string[]
}

export interface SourceInfo {
  title: string
  excerpt: string
  url: string
  favicon?: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          plan: Plan
          posts_this_month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan?: Plan
          posts_this_month?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan?: Plan
          posts_this_month?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          mode: 'topic' | 'url' | 'job'
          topic: string | null
          url: string | null
          source: SourceInfo | null
          job_config: JobConfig | null
          tone: string
          style: string
          language: string
          content: string
          char_count: number | null
          versions: Json[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mode: 'topic' | 'url' | 'job'
          topic?: string | null
          url?: string | null
          source?: SourceInfo | null
          job_config?: JobConfig | null
          tone: string
          style: string
          language?: string
          content: string
          char_count?: number | null
          versions?: Json[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mode?: 'topic' | 'url' | 'job'
          topic?: string | null
          url?: string | null
          source?: SourceInfo | null
          job_config?: JobConfig | null
          tone?: string
          style?: string
          language?: string
          content?: string
          char_count?: number | null
          versions?: Json[] | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
