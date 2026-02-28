import { supabase } from '../supabase'
import type { HistoryItem } from '../../types/history'
import type { InputMode, Tone, Style, Language, SerializedPostVersion, StoryPoint } from '../../types/post'
import type { JobConfig } from '../../types/job'
import type { SourceInfo } from '../../types/source'
import type { Database, Json } from '../../types/database'
import type { StorageAdapter, NewHistoryItem, HistoryItemUpdate } from './types'

type PostInsert = Database['public']['Tables']['posts']['Insert']

const MAX_ENTRIES = 50

interface PostRow {
  id: string
  user_id: string
  mode: string
  topic: string | null
  url: string | null
  source: unknown
  job_config: unknown
  tone: string
  style: string
  language: string
  content: string
  char_count: number | null
  versions: unknown
  story_points: unknown
  created_at: string
}

function transformPost(post: PostRow): HistoryItem {
  return {
    id: post.id,
    user_id: post.user_id,
    mode: post.mode as InputMode,
    topic: post.topic || '',
    url: post.url || undefined,
    source: post.source as SourceInfo | undefined,
    jobConfig: post.job_config as JobConfig | undefined,
    tone: post.tone as Tone,
    style: post.style as Style,
    language: (post.language || 'de') as Language,
    content: post.content,
    createdAt: post.created_at,
    charCount: post.char_count || post.content.length,
    versions: Array.isArray(post.versions) ? post.versions as SerializedPostVersion[] : undefined,
    storyPoints: Array.isArray(post.story_points) ? post.story_points as StoryPoint[] : undefined,
  }
}

export const supabaseStorageAdapter: StorageAdapter = {
  async loadHistory(limit = MAX_ENTRIES): Promise<HistoryItem[]> {
    if (!supabase) return []

    // userId is embedded in the RLS policy, but we need it for the query
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error loading posts from Supabase:', error)
      return []
    }

    return (data || []).map(transformPost)
  },

  async addItem(userId: string | undefined, item: NewHistoryItem): Promise<HistoryItem | null> {
    if (!supabase || !userId) return null

    const postToInsert: PostInsert = {
      user_id: userId,
      mode: item.mode,
      topic: item.topic || null,
      url: item.url ?? null,
      source: item.source ?? null,
      job_config: item.jobConfig ?? null,
      tone: item.tone,
      style: item.style,
      language: item.language,
      content: item.content,
      char_count: item.content.length,
      versions: (item.versions ?? null) as Json[] | null,
      story_points: item.storyPoints ?? null,
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(postToInsert as never)
      .select()
      .single()

    if (error) {
      console.error('Error saving post to Supabase:', error)
      return null
    }

    return data ? transformPost(data as PostRow) : null
  },

  async updateItem(userId: string | undefined, id: string, updates: HistoryItemUpdate): Promise<void> {
    if (!supabase || !userId) return

    const dbUpdates: Record<string, unknown> = {}
    if (updates.content !== undefined) dbUpdates.content = updates.content
    if (updates.charCount !== undefined) dbUpdates.char_count = updates.charCount
    if (updates.versions !== undefined) dbUpdates.versions = updates.versions

    const { error } = await supabase
      .from('posts')
      .update(dbUpdates as never)
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating post in Supabase:', error)
    }
  },

  async removeItem(userId: string | undefined, id: string): Promise<void> {
    if (!supabase || !userId) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting post from Supabase:', error)
    }
  },

  async clearAll(userId: string | undefined): Promise<void> {
    if (!supabase || !userId) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error clearing posts from Supabase:', error)
    }
  },
}
