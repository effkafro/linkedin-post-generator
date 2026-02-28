// =============================================
// Analytics Types - Social Media Dashboard
// =============================================

export type TimeRange = '7d' | '30d' | '90d' | 'all'

export type ExportType = 'company' | 'personal'

export type MediaType = 'text' | 'image' | 'video' | 'carousel'

export type ScrapeStatus = 'pending' | 'running' | 'success' | 'error'

// --- DB Row Types ---

export interface CompanyPage {
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

export interface ScrapedPost {
  id: string
  company_page_id: string
  user_id: string
  platform: string
  external_id: string | null
  content: string | null
  post_url: string | null
  posted_at: string | null
  reactions_count: number
  comments_count: number
  shares_count: number
  engagement_total: number
  media_type: MediaType
  impressions: number
  clicks: number
  ctr: number
  engagement_rate: number
  video_views: number
  source_type: string
  raw_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ScrapeRun {
  id: string
  company_page_id: string
  user_id: string
  status: ScrapeStatus
  posts_found: number
  posts_new: number
  posts_updated: number
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  run_type: string
  file_name: string | null
}

// --- Computed / Aggregated Types ---

export interface EngagementMetrics {
  totalReactions: number
  totalComments: number
  totalShares: number
  totalEngagement: number
  avgPerPost: number
  totalPosts: number
  topPostEngagement: number
}

export interface ImpressionMetrics {
  totalImpressions: number
  totalClicks: number
  avgCTR: number
  avgEngagementRate: number
}

export interface PostPerformance {
  post: ScrapedPost
  engagementRate: number
  isOutlier: 'top' | 'bottom' | null
}

export interface EngagementTrend {
  date: string
  reactions: number
  comments: number
  shares: number
  total: number
  postCount: number
  impressions?: number
}

// --- Daily Analytics (Personal Export) ---

export interface DailyAnalytics {
  id: string
  user_id: string
  company_page_id: string
  date: string
  impressions: number
  engagements: number
  new_followers: number
  created_at: string
}

export interface DailyEngagement {
  date: string
  impressions: number
  engagements: number
}

export interface FollowerData {
  date: string
  newFollowers: number
}

export interface DiscoverySummary {
  impressions: number
  membersReached: number
}

export interface PostFrequency {
  week: string
  postCount: number
}
