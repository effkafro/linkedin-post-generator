import { z } from 'zod'

/** Schema für die Emoji-Präferenz */
export const emojiPreferenceSchema = z.enum(['none', 'minimal', 'moderate'])

/** Schema für die Sprach-Präferenz */
export const languageSchema = z.enum(['de', 'en'])

/** Schema für den Hashtag-Stil */
export const hashtagStyleSchema = z.enum(['branded', 'trending', 'niche'])

/** Schema für das Voice-Profil (Supabase Daten) */
export const voiceProfileSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  // Identität
  full_name: z.string(),
  job_title: z.string(),
  company: z.string(),
  industry: z.string(),
  bio: z.string(),
  // Stimme
  expertise_topics: z.array(z.string()),
  tone_preferences: z.array(z.string()),
  target_audience: z.string(),
  personal_values: z.array(z.string()),
  positioning_statement: z.string(),
  // Einstellungen
  preferred_language: languageSchema,
  preferred_emojis: emojiPreferenceSchema,
  hashtag_style: hashtagStyleSchema,
  default_cta_style: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

/** Schema für Beispiel-Posts */
export const examplePostSchema = z.object({
  id: z.string(),
  profile_id: z.string(),
  content: z.string(),
  platform: z.literal('linkedin'),
  performance_notes: z.string().optional(),
  created_at: z.string(),
})

/** Schema für den Profil-Payload (wird an n8n gesendet) */
export const profilePayloadSchema = z.object({
  full_name: z.string(),
  job_title: z.string(),
  company: z.string(),
  expertise_topics: z.array(z.string()),
  target_audience: z.string(),
  positioning_statement: z.string(),
  personal_values: z.array(z.string()),
  tone_preferences: z.array(z.string()),
  preferred_emojis: emojiPreferenceSchema,
  example_posts: z.array(z.string()),
})

/** Abgeleitete Typen */
export type VoiceProfileSchema = z.infer<typeof voiceProfileSchema>
export type ExamplePostSchema = z.infer<typeof examplePostSchema>
export type ProfilePayloadSchema = z.infer<typeof profilePayloadSchema>
