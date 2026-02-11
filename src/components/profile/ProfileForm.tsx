import type { VoiceProfile } from '../../types/profile'
import { INDUSTRY_OPTIONS } from '../../constants/job'

interface ProfileFormProps {
  profile: VoiceProfile | null
  saving: boolean
  onUpdate: (updates: Partial<VoiceProfile>) => Promise<void>
}

export default function ProfileForm({ profile, saving, onUpdate }: ProfileFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Persönliche Daten</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="profile-name" className="text-sm font-medium pl-1 text-foreground/80">
            Vollständiger Name
          </label>
          <input
            id="profile-name"
            type="text"
            value={profile?.full_name || ''}
            onChange={e => onUpdate({ full_name: e.target.value })}
            placeholder="Max Mustermann"
            disabled={saving}
            className="flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="profile-title" className="text-sm font-medium pl-1 text-foreground/80">
            Jobtitel
          </label>
          <input
            id="profile-title"
            type="text"
            value={profile?.job_title || ''}
            onChange={e => onUpdate({ job_title: e.target.value })}
            placeholder="z.B. CTO, Marketing Manager"
            disabled={saving}
            className="flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="profile-company" className="text-sm font-medium pl-1 text-foreground/80">
            Unternehmen
          </label>
          <input
            id="profile-company"
            type="text"
            value={profile?.company || ''}
            onChange={e => onUpdate({ company: e.target.value })}
            placeholder="z.B. Acme GmbH"
            disabled={saving}
            className="flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all disabled:opacity-50"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="profile-industry" className="text-sm font-medium pl-1 text-foreground/80">
            Branche
          </label>
          <div className="relative">
            <select
              id="profile-industry"
              value={profile?.industry || ''}
              onChange={e => onUpdate({ industry: e.target.value })}
              disabled={saving}
              className="flex h-12 w-full items-center justify-between rounded-2xl glass-input px-4 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer disabled:opacity-50"
            >
              <option value="">Branche wählen...</option>
              {INDUSTRY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground/70">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="profile-bio" className="text-sm font-medium pl-1 text-foreground/80">
          Kurzbiografie
        </label>
        <textarea
          id="profile-bio"
          value={profile?.bio || ''}
          onChange={e => onUpdate({ bio: e.target.value })}
          placeholder="Erzähle kurz, wer du bist und was dich antreibt..."
          rows={3}
          disabled={saving}
          className="flex w-full rounded-2xl glass-input px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-all disabled:opacity-50"
        />
      </div>
    </div>
  )
}
