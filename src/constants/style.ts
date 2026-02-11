import type { Style } from '../types/post'

export const STYLE_OPTIONS: { value: Style; label: string }[] = [
  { value: 'story', label: 'Story' },
  { value: 'listicle', label: 'Listicle' },
  { value: 'question-hook', label: 'Question-Hook' },
  { value: 'bold-statement', label: 'Bold-Statement' },
]

export const STYLE_DESCRIPTIONS: Record<Style, string> = {
  story: 'Persönliche Geschichte mit Lesson Learned. "Als ich vor X Jahren..."',
  listicle: 'Nummerierte Liste mit Key Points. "5 Dinge, die ich gelernt habe..."',
  'question-hook': 'Startet mit provokanter Frage. "Was wäre, wenn...?"',
  'bold-statement': 'Startet mit mutiger These. "X ist tot." oder "Vergiss alles über X."',
}
