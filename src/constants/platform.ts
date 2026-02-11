export type Platform = 'linkedin'

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
]

export const PLATFORM_RULES: Record<Platform, { maxChars: number; hashtagLimit: number }> = {
  linkedin: { maxChars: 3000, hashtagLimit: 5 },
}

export const DEFAULT_PLATFORM: Platform = 'linkedin'
