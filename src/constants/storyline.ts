import type { StoryPoint } from '../types/post'

export const DEFAULT_STORY_POINTS: StoryPoint[] = [
  { label: 'Einstieg / Hook', content: '' },
  { label: 'Hauptteil', content: '' },
  { label: 'Abschluss / CTA', content: '' },
]

export const STORY_POINT_PLACEHOLDERS: string[] = [
  'Was fesselt den Leser? Ein Problem, eine Frage, ein überraschendes Erlebnis...',
  'Was ist die Kernaussage? Deine Erfahrung, Lösung oder Erkenntnis...',
  'Was soll der Leser mitnehmen oder tun? Dein Call-to-Action...',
]

export const STORY_POINT_LABEL_PLACEHOLDERS: string[] = [
  'z.B. Problem',
  'z.B. Lösung',
  'z.B. Fazit',
]
