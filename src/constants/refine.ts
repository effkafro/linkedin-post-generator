import type { RefineAction } from '../types/post'

export const REFINE_OPTIONS: { action: RefineAction; label: string }[] = [
  { action: 'shorter', label: 'Kürzer' },
  { action: 'longer', label: 'Länger' },
  { action: 'formal', label: 'Formeller' },
  { action: 'casual', label: 'Lockerer' },
]

export const REFINE_PROMPTS: Record<Exclude<RefineAction, 'custom'>, string> = {
  shorter: "Kürze diesen LinkedIn-Post auf maximal 800 Zeichen. Behalte den Kern der Aussage:",
  longer: "Erweitere diesen LinkedIn-Post mit mehr Details und Beispielen (max 1800 Zeichen):",
  formal: "Formuliere diesen LinkedIn-Post professioneller und formeller um:",
  casual: "Formuliere diesen LinkedIn-Post lockerer und persönlicher um:",
}
