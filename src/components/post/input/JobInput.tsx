import type { JobSubStyle, CandidatePersona, Industry, JobConfig } from '../../../types/job'
import { JOB_SUB_STYLE_OPTIONS, CANDIDATE_PERSONA_OPTIONS, INDUSTRY_OPTIONS } from '../../../constants/job'
import { isValidUrl } from '../../../utils/urlValidation'
import GlassSelect from '../shared/GlassSelect'

interface JobInputProps {
  jobConfig: JobConfig
  topic: string
  onJobConfigChange: (updates: Partial<JobConfig>) => void
  onTopicChange: (value: string) => void
}

export default function JobInput({ jobConfig, topic, onJobConfigChange, onTopicChange }: JobInputProps) {
  return (
    <div className="space-y-6">
      {/* Has existing posting toggle */}
      <div className="space-y-3">
        <label className="text-sm font-medium pl-1 text-foreground/80">Stellenausschreibung vorhanden?</label>
        <div className="flex gap-3 p-1 rounded-2xl bg-secondary/20">
          <button
            type="button"
            onClick={() => onJobConfigChange({ hasExistingPosting: true })}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${jobConfig.hasExistingPosting
              ? 'glass-button shadow-lg'
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
          >
            Ja, ich habe eine URL
          </button>
          <button
            type="button"
            onClick={() => onJobConfigChange({ hasExistingPosting: false })}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${!jobConfig.hasExistingPosting
              ? 'glass-button shadow-lg'
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
          >
            Nein, ich gebe Details ein
          </button>
        </div>
      </div>

      {/* Conditional inputs based on hasExistingPosting */}
      {jobConfig.hasExistingPosting ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="jobUrl" className="text-sm font-medium">
              URL zur Stellenausschreibung
            </label>
            <input
              id="jobUrl"
              type="url"
              value={jobConfig.jobUrl || ''}
              onChange={e => onJobConfigChange({ jobUrl: e.target.value })}
              placeholder="https://careers.example.com/jobs/123"
              className={`flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all ${jobConfig.jobUrl && !isValidUrl(jobConfig.jobUrl)
                ? 'border-destructive/50 ring-destructive/50 focus-visible:ring-destructive/50'
                : ''
                }`}
            />
            {jobConfig.jobUrl && !isValidUrl(jobConfig.jobUrl) && (
              <p className="text-xs text-destructive">Bitte gib eine gültige URL ein</p>
            )}
          </div>
          <div className="space-y-3">
            <label htmlFor="jobContext" className="text-sm font-medium pl-1 text-foreground/80">
              Zusätzlicher Kontext (optional)
            </label>
            <textarea
              id="jobContext"
              value={topic}
              onChange={e => onTopicChange(e.target.value)}
              placeholder="z.B. 'Wir haben gerade unser Team verdoppelt' oder 'Diese Stelle ist perfekt für...'"
              rows={2}
              className="flex w-full rounded-2xl glass-input px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-all"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="jobTitle" className="text-sm font-medium pl-1 text-foreground/80">
                Jobtitel *
              </label>
              <input
                id="jobTitle"
                type="text"
                value={jobConfig.jobTitle || ''}
                onChange={e => onJobConfigChange({ jobTitle: e.target.value })}
                placeholder="z.B. Senior Frontend Developer"
                className="flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="companyName" className="text-sm font-medium pl-1 text-foreground/80">
                Unternehmen
              </label>
              <input
                id="companyName"
                type="text"
                value={jobConfig.companyName || ''}
                onChange={e => onJobConfigChange({ companyName: e.target.value })}
                placeholder="z.B. Acme GmbH"
                className="flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label htmlFor="jobBenefits" className="text-sm font-medium pl-1 text-foreground/80">
              Benefits / Vorteile
            </label>
            <textarea
              id="jobBenefits"
              value={jobConfig.benefits?.join('\n') || ''}
              onChange={e => onJobConfigChange({ benefits: e.target.value.split('\n').filter(Boolean) })}
              placeholder="Ein Benefit pro Zeile, z.B.&#10;Remote-First Kultur&#10;30 Tage Urlaub&#10;Weiterbildungsbudget"
              rows={3}
              className="flex w-full rounded-2xl glass-input px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-all"
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="jobRequirements" className="text-sm font-medium pl-1 text-foreground/80">
              Anforderungen
            </label>
            <textarea
              id="jobRequirements"
              value={jobConfig.requirements?.join('\n') || ''}
              onChange={e => onJobConfigChange({ requirements: e.target.value.split('\n').filter(Boolean) })}
              placeholder="Eine Anforderung pro Zeile, z.B.&#10;5+ Jahre React-Erfahrung&#10;TypeScript-Kenntnisse&#10;Teamfähigkeit"
              rows={3}
              className="flex w-full rounded-2xl glass-input px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-all"
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="jobAdditionalContext" className="text-sm font-medium pl-1 text-foreground/80">
              Zusätzlicher Kontext
            </label>
            <textarea
              id="jobAdditionalContext"
              value={topic}
              onChange={e => onTopicChange(e.target.value)}
              placeholder="Was macht diese Stelle besonders? Warum sollte jemand sich bewerben?"
              rows={2}
              className="flex w-full rounded-2xl glass-input px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Job-specific options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label htmlFor="jobSubStyle" className="text-sm font-medium pl-1 text-foreground/80">
            Post-Stil
          </label>
          <GlassSelect
            id="jobSubStyle"
            value={jobConfig.jobSubStyle}
            onChange={v => onJobConfigChange({ jobSubStyle: v as JobSubStyle })}
            options={JOB_SUB_STYLE_OPTIONS}
          />
          <p className="text-xs text-muted-foreground pl-1">
            {JOB_SUB_STYLE_OPTIONS.find(o => o.value === jobConfig.jobSubStyle)?.description}
          </p>
        </div>
        <div className="space-y-3">
          <label htmlFor="candidatePersona" className="text-sm font-medium pl-1 text-foreground/80">
            Zielgruppe
          </label>
          <GlassSelect
            id="candidatePersona"
            value={jobConfig.candidatePersona}
            onChange={v => onJobConfigChange({ candidatePersona: v as CandidatePersona })}
            options={CANDIDATE_PERSONA_OPTIONS}
          />
          <p className="text-xs text-muted-foreground pl-1">
            {CANDIDATE_PERSONA_OPTIONS.find(o => o.value === jobConfig.candidatePersona)?.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <label htmlFor="industry" className="text-sm font-medium pl-1 text-foreground/80">
            Branche
          </label>
          <GlassSelect
            id="industry"
            value={jobConfig.industry}
            onChange={v => onJobConfigChange({ industry: v as Industry })}
            options={INDUSTRY_OPTIONS}
          />
        </div>
        <div className="space-y-3">
          <label htmlFor="location" className="text-sm font-medium pl-1 text-foreground/80">
            Standort
          </label>
          <input
            id="location"
            type="text"
            value={jobConfig.location || ''}
            onChange={e => onJobConfigChange({ location: e.target.value })}
            placeholder="z.B. Berlin"
            className="flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium pl-1 text-foreground/80">Remote möglich?</label>
          <button
            type="button"
            onClick={() => onJobConfigChange({ remoteOption: !jobConfig.remoteOption })}
            className={`flex h-12 w-full items-center justify-center rounded-2xl text-sm font-medium transition-all duration-300 ${jobConfig.remoteOption
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-inner'
              : 'glass-input text-muted-foreground hover:bg-white/5'
              }`}
          >
            {jobConfig.remoteOption ? 'Ja, Remote möglich' : 'Nein, vor Ort'}
          </button>
        </div>
      </div>
    </div>
  )
}
