export type FeedbackType = 'feature_request' | 'feedback' | 'bug'
export type FeedbackCategory = 'post_generator' | 'analytics' | 'profile' | 'general' | 'other'
export type FeedbackStatus = 'new' | 'acknowledged' | 'planned' | 'done'

export interface FeedbackItem {
  id: string
  user_id: string
  type: FeedbackType
  category: FeedbackCategory | null
  title: string
  description: string
  status: FeedbackStatus
  created_at: string
}
