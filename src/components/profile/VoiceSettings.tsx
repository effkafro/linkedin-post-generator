import type { VoiceProfile } from '../../types/profile'

interface VoiceSettingsProps {
  profile: VoiceProfile | null
  saving: boolean
  onUpdate: (updates: Partial<VoiceProfile>) => Promise<void>
}

function TagInput({ value, onChange, placeholder, disabled }: {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder: string
  disabled: boolean
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const input = e.currentTarget
      const tag = input.value.trim()
      if (tag && !value.includes(tag)) {
        onChange([...value, tag])
        input.value = ''
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/10">
            {tag}
            <button
              onClick={() => onChange(value.filter(t => t !== tag))}
              className="hover:text-destructive transition-colors"
              disabled={disabled}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex w-full h-10 rounded-xl glass-input px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all disabled:opacity-50"
      />
    </div>
  )
}

export default function VoiceSettings({ profile, saving, onUpdate }: VoiceSettingsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Voice & Positionierung</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium pl-1 text-foreground/80">
          Expertise-Themen
        </label>
        <TagInput
          value={profile?.expertise_topics || []}
          onChange={tags => onUpdate({ expertise_topics: tags })}
          placeholder="z.B. KI, Leadership, SaaS (Enter zum Hinzufügen)"
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium pl-1 text-foreground/80">
          Bevorzugte Tonalität
        </label>
        <TagInput
          value={profile?.tone_preferences || []}
          onChange={tags => onUpdate({ tone_preferences: tags })}
          placeholder="z.B. casual, educational, inspirierend"
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="target-audience" className="text-sm font-medium pl-1 text-foreground/80">
          Zielgruppe
        </label>
        <input
          id="target-audience"
          type="text"
          value={profile?.target_audience || ''}
          onChange={e => onUpdate({ target_audience: e.target.value })}
          placeholder="z.B. CTOs und Engineering-Leads in Tech-Startups"
          disabled={saving}
          className="flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium pl-1 text-foreground/80">
          Persönliche Werte
        </label>
        <TagInput
          value={profile?.personal_values || []}
          onChange={tags => onUpdate({ personal_values: tags })}
          placeholder="z.B. Transparenz, Innovation, Nachhaltigkeit"
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="positioning" className="text-sm font-medium pl-1 text-foreground/80">
          Positioning Statement
        </label>
        <textarea
          id="positioning"
          value={profile?.positioning_statement || ''}
          onChange={e => onUpdate({ positioning_statement: e.target.value })}
          placeholder="z.B. Ich helfe Tech-Startups, ihre Engineering-Teams zu skalieren."
          rows={2}
          disabled={saving}
          className="flex w-full rounded-2xl glass-input px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-all disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium pl-1 text-foreground/80">Emoji-Nutzung</label>
          <div className="flex gap-2">
            {(['none', 'minimal', 'moderate'] as const).map(option => (
              <button
                key={option}
                onClick={() => onUpdate({ preferred_emojis: option })}
                disabled={saving}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${(profile?.preferred_emojis || 'minimal') === option
                  ? 'glass-button shadow-sm'
                  : 'glass-input text-muted-foreground hover:text-foreground'
                  }`}
              >
                {option === 'none' ? 'Keine' : option === 'minimal' ? 'Wenig' : 'Moderat'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium pl-1 text-foreground/80">Hashtag-Stil</label>
          <div className="flex gap-2">
            {(['branded', 'trending', 'niche'] as const).map(option => (
              <button
                key={option}
                onClick={() => onUpdate({ hashtag_style: option })}
                disabled={saving}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${(profile?.hashtag_style || 'niche') === option
                  ? 'glass-button shadow-sm'
                  : 'glass-input text-muted-foreground hover:text-foreground'
                  }`}
              >
                {option === 'branded' ? 'Branded' : option === 'trending' ? 'Trending' : 'Nische'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="cta-style" className="text-sm font-medium pl-1 text-foreground/80">
            CTA-Stil
          </label>
          <input
            id="cta-style"
            type="text"
            value={profile?.default_cta_style || ''}
            onChange={e => onUpdate({ default_cta_style: e.target.value })}
            placeholder="z.B. Frage stellen"
            disabled={saving}
            className="flex w-full h-10 rounded-xl glass-input px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  )
}
