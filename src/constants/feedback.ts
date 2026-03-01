import type { FeedbackType, FeedbackCategory } from '../types/feedback'

export const FEEDBACK_TYPE_OPTIONS: { value: FeedbackType; label: string; description: string }[] = [
  { value: 'feature_request', label: 'Feature Wunsch', description: 'Schlage eine neue Funktion vor' },
  { value: 'feedback', label: 'Feedback', description: 'Teile deine Meinung mit' },
  { value: 'bug', label: 'Bug melden', description: 'Melde einen Fehler' },
]

export const FEEDBACK_CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: 'post_generator', label: 'Post Generator' },
  { value: 'analytics', label: 'Analytics Dashboard' },
  { value: 'profile', label: 'Profil & Stimme' },
  { value: 'general', label: 'Allgemein' },
  { value: 'other', label: 'Sonstiges' },
]
