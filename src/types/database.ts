import type { SourceInfo } from './source'
import type { JobConfig } from './job'
import type { StoryPoint } from './post'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Plan = 'free' | 'creator' | 'pro' | 'team' | 'agency'

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
          story_points: StoryPoint[] | null
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
          story_points?: StoryPoint[] | null
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
          story_points?: StoryPoint[] | null
          created_at?: string
        }
      }
      company_pages: {
        Row: {
          id: string
          user_id: string
          platform: string
          page_url: string
          page_name: string | null
          page_avatar_url: string | null
          is_active: boolean
          last_scraped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform?: string
          page_url: string
          page_name?: string | null
          page_avatar_url?: string | null
          is_active?: boolean
          last_scraped_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          page_url?: string
          page_name?: string | null
          page_avatar_url?: string | null
          is_active?: boolean
          last_scraped_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scraped_posts: {
        Row: {
          id: string
          company_page_id: string
          user_id: string
          platform: string
          external_id: string
          content: string | null
          post_url: string | null
          posted_at: string | null
          reactions_count: number
          comments_count: number
          shares_count: number
          engagement_total: number
          media_type: string
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_page_id: string
          user_id: string
          platform?: string
          external_id: string
          content?: string | null
          post_url?: string | null
          posted_at?: string | null
          reactions_count?: number
          comments_count?: number
          shares_count?: number
          media_type?: string
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_page_id?: string
          user_id?: string
          platform?: string
          external_id?: string
          content?: string | null
          post_url?: string | null
          posted_at?: string | null
          reactions_count?: number
          comments_count?: number
          shares_count?: number
          media_type?: string
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          type: 'feature_request' | 'feedback' | 'bug'
          category: 'post_generator' | 'analytics' | 'profile' | 'general' | 'other' | null
          title: string
          description: string
          status: 'new' | 'acknowledged' | 'planned' | 'done'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'feature_request' | 'feedback' | 'bug'
          category?: 'post_generator' | 'analytics' | 'profile' | 'general' | 'other' | null
          title: string
          description: string
          status?: 'new' | 'acknowledged' | 'planned' | 'done'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'feature_request' | 'feedback' | 'bug'
          category?: 'post_generator' | 'analytics' | 'profile' | 'general' | 'other' | null
          title?: string
          description?: string
          status?: 'new' | 'acknowledged' | 'planned' | 'done'
          created_at?: string
        }
      }
      scrape_runs: {
        Row: {
          id: string
          company_page_id: string
          user_id: string
          status: string
          posts_found: number
          posts_new: number
          posts_updated: number
          error_message: string | null
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          company_page_id: string
          user_id: string
          status?: string
          posts_found?: number
          posts_new?: number
          posts_updated?: number
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          company_page_id?: string
          user_id?: string
          status?: string
          posts_found?: number
          posts_new?: number
          posts_updated?: number
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
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
