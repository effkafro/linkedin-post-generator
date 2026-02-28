import { useState } from 'react'
import type { Tone, Style, Language, RefineAction } from '../../../types/post'
import { REFINE_OPTIONS } from '../../../constants/refine'

interface RefinePanelProps {
  tone: Tone
  style: Style
  language: Language
  refining: RefineAction | null
  loading: boolean
  onRefine: (action: RefineAction, customInstruction?: string, settings?: { tone: Tone; style: Style; language: Language }) => void
}

export default function RefinePanel({ tone, style, language, refining, loading, onRefine }: RefinePanelProps) {
  const [customRefineText, setCustomRefineText] = useState('')
  const disabled = !!refining || loading

  return (
    <>
      {/* Refine Options Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Verfeinern</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {REFINE_OPTIONS.map(({ action, label }) => (
            <button
              key={action}
              onClick={() => onRefine(action, undefined, { tone, style, language })}
              disabled={disabled}
              className="glass-button h-10 px-4 text-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
            >
              {refining === action ? (
                <span className="animate-spin mr-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              ) : null}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Refine Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={customRefineText}
          onChange={(e) => setCustomRefineText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customRefineText.trim() && !disabled) {
              onRefine('custom', customRefineText, { tone, style, language })
              setCustomRefineText('')
            }
          }}
          placeholder="z.B. Mehr Emojis hinzufügen..."
          disabled={disabled}
          className="flex-1 h-11 rounded-xl glass-input px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        />
        <button
          onClick={() => {
            if (customRefineText.trim()) {
              onRefine('custom', customRefineText, { tone, style, language })
              setCustomRefineText('')
            }
          }}
          disabled={!customRefineText.trim() || disabled}
          className="glass-button h-11 px-6 text-sm font-medium whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
        >
          {refining === 'custom' ? (
            <span className="animate-spin mr-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
          ) : null}
          Anpassen
        </button>
      </div>

    </>
  )
}
