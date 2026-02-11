import type { Tone } from '../types/post'

export const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'educational', label: 'Educational' },
]

export const TONE_DESCRIPTIONS: Record<Tone, string> = {
  professional: 'Seriös, fachlich, business-orientiert. Branchenjargon erlaubt.',
  casual: 'Locker, authentisch, nahbar. Persönliche "Ich"-Perspektive.',
  inspirational: 'Motivierend, empowernd, positiv. Emotionale Trigger und Metaphern.',
  educational: 'Lehrreich, informativ, How-to-Stil. Klar strukturiert mit Bullet Points.',
}
