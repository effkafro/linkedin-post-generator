import type { VoiceProfile, ExamplePost, ProfilePayload } from '../types/profile'

export function buildProfilePayload(
  profile: VoiceProfile,
  examplePosts: ExamplePost[]
): ProfilePayload {
  return {
    full_name: profile.full_name,
    job_title: profile.job_title,
    company: profile.company,
    expertise_topics: profile.expertise_topics,
    target_audience: profile.target_audience,
    positioning_statement: profile.positioning_statement,
    personal_values: profile.personal_values,
    tone_preferences: profile.tone_preferences,
    preferred_emojis: profile.preferred_emojis,
    example_posts: examplePosts.map(ep => ep.content),
  }
}
