import { useState, useEffect, useCallback } from 'react'
import type { Tone, Style, Language } from '../../../types/post'
import { TONE_OPTIONS, TONE_DESCRIPTIONS } from '../../../constants/tone'
import { STYLE_OPTIONS, STYLE_DESCRIPTIONS } from '../../../constants/style'
import { LANGUAGE_OPTIONS } from '../../../constants/language'
import GlassSelect from '../shared/GlassSelect'
import HelpModal from '../shared/HelpModal'

interface SettingsRowProps {
  tone: Tone
  style: Style
  language: Language
  onToneChange: (tone: Tone) => void
  onStyleChange: (style: Style) => void
  onLanguageChange: (language: Language) => void
  useProfile: boolean
  onUseProfileChange: (enabled: boolean) => void
  profileAvailable: boolean
  profileCompleteness: number
}

export default function SettingsRow({ tone, style, language, onToneChange, onStyleChange, onLanguageChange, useProfile, onUseProfileChange, profileAvailable, profileCompleteness }: SettingsRowProps) {
  const [showToneHelp, setShowToneHelp] = useState(false)
  const [showStyleHelp, setShowStyleHelp] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowToneHelp(false)
      setShowStyleHelp(false)
    }
  }, [])

  useEffect(() => {
    if (showToneHelp || showStyleHelp) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showToneHelp, showStyleHelp, handleKeyDown])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="flex items-center pl-1">
            <label htmlFor="tone" className="text-sm font-medium leading-none text-foreground/80">
              Tonfall
            </label>
            <button
              type="button"
              onClick={() => setShowToneHelp(true)}
              className="ml-1.5 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Tonfall-Hilfe anzeigen"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <GlassSelect id="tone" value={tone} onChange={onToneChange} options={TONE_OPTIONS} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center pl-1">
            <label htmlFor="style" className="text-sm font-medium leading-none text-foreground/80">
              Stil
            </label>
            <button
              type="button"
              onClick={() => setShowStyleHelp(true)}
              className="ml-1.5 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Stil-Hilfe anzeigen"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <GlassSelect id="style" value={style} onChange={onStyleChange} options={STYLE_OPTIONS} />
        </div>

        <div className="space-y-3">
          <label htmlFor="language" className="text-sm font-medium leading-none text-foreground/80 pl-1">
            Sprache
          </label>
          <GlassSelect id="language" value={language} onChange={onLanguageChange} options={LANGUAGE_OPTIONS} />
        </div>
      </div>

      {profileAvailable && (
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            role="switch"
            aria-checked={useProfile}
            onClick={() => onUseProfileChange(!useProfile)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              useProfile ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                useProfile ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <label
            className="text-sm font-medium text-foreground/80 cursor-pointer select-none"
            onClick={() => onUseProfileChange(!useProfile)}
          >
            Mein Profil als Kontext verwenden
          </label>
          {useProfile && profileCompleteness < 50 && (
            <span className="text-xs text-amber-500/90">
              Profil nur {profileCompleteness}% ausgefuellt
            </span>
          )}
        </div>
      )}

      {showToneHelp && (
        <HelpModal
          title="Tonfall-Optionen"
          items={TONE_OPTIONS.map(opt => ({ label: opt.label, description: TONE_DESCRIPTIONS[opt.value] }))}
          onClose={() => setShowToneHelp(false)}
        />
      )}

      {showStyleHelp && (
        <HelpModal
          title="Stil-Optionen"
          items={STYLE_OPTIONS.map(opt => ({ label: opt.label, description: STYLE_DESCRIPTIONS[opt.value] }))}
          onClose={() => setShowStyleHelp(false)}
        />
      )}
    </>
  )
}
