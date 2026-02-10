import { useState, useEffect, useRef, useCallback } from 'react'
import { usePostGenerator, type Tone, type Style, type Language, type RefineAction, type JobSubStyle, type CandidatePersona, type Industry } from '../hooks/usePostGenerator'
import type { InputMode, SourceInfo, JobConfig, SerializedPostVersion } from '../types/history'

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  professional: 'Seriös, fachlich, business-orientiert. Branchenjargon erlaubt.',
  casual: 'Locker, authentisch, nahbar. Persönliche "Ich"-Perspektive.',
  inspirational: 'Motivierend, empowernd, positiv. Emotionale Trigger und Metaphern.',
  educational: 'Lehrreich, informativ, How-to-Stil. Klar strukturiert mit Bullet Points.',
}

const STYLE_DESCRIPTIONS: Record<Style, string> = {
  story: 'Persönliche Geschichte mit Lesson Learned. "Als ich vor X Jahren..."',
  listicle: 'Nummerierte Liste mit Key Points. "5 Dinge, die ich gelernt habe..."',
  'question-hook': 'Startet mit provokanter Frage. "Was wäre, wenn...?"',
  'bold-statement': 'Startet mit mutiger These. "X ist tot." oder "Vergiss alles über X."',
}

const JOB_SUB_STYLE_OPTIONS: { value: JobSubStyle; label: string; description: string }[] = [
  { value: 'wir-suchen', label: 'Wir suchen', description: 'Klassisch, direkt. "Wir suchen ab sofort..."' },
  { value: 'kennt-jemanden', label: 'Kennt ihr jemanden?', description: 'Netzwerk aktivieren. "Kennt jemand von euch..."' },
  { value: 'persoenlich', label: 'Persönliche Empfehlung', description: 'Storytelling. "In meinem Team suchen wir..."' },
  { value: 'opportunity', label: 'Opportunity Pitch', description: 'Benefits-first. "Diese Chance solltest du nicht verpassen..."' },
]

const CANDIDATE_PERSONA_OPTIONS: { value: CandidatePersona; label: string; description: string }[] = [
  { value: 'junior', label: 'Junior / Berufseinsteiger', description: 'Mentoring, Lernmöglichkeiten betonen' },
  { value: 'senior', label: 'Senior / Erfahren', description: 'Verantwortung, technische Challenges betonen' },
  { value: 'c-level', label: 'C-Level / Management', description: 'Strategie, Leadership, Vision betonen' },
  { value: 'freelancer', label: 'Freelancer / Consultant', description: 'Projektdetails, Flexibilität betonen' },
]

const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
  { value: 'tech', label: 'Tech & IT' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare & Pharma' },
  { value: 'marketing', label: 'Marketing & Creative' },
  { value: 'hr', label: 'HR & People' },
  { value: 'legal', label: 'Legal & Compliance' },
  { value: 'other', label: 'Andere Branche' },
]

export interface PostGeneratorProps {
  initialState?: {
    mode: InputMode
    topic: string
    url?: string
    source?: SourceInfo
    jobConfig?: JobConfig
    tone: Tone
    style: Style
    language: Language
    content: string
    versions?: SerializedPostVersion[]
  }
  onPostGenerated?: (data: {
    mode: InputMode
    topic: string
    url?: string
    source?: SourceInfo
    jobConfig?: JobConfig
    tone: Tone
    style: Style
    language: Language
    content: string
    versions?: SerializedPostVersion[]
  }) => void
  onVersionsChange?: (data: { versions: SerializedPostVersion[], content: string } | null) => void
}

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'educational', label: 'Educational' },
]

const STYLE_OPTIONS: { value: Style; label: string }[] = [
  { value: 'story', label: 'Story' },
  { value: 'listicle', label: 'Listicle' },
  { value: 'question-hook', label: 'Question-Hook' },
  { value: 'bold-statement', label: 'Bold-Statement' },
]

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
]

const REFINE_OPTIONS: { action: RefineAction; label: string }[] = [
  { action: 'shorter', label: 'Kürzer' },
  { action: 'longer', label: 'Länger' },
  { action: 'formal', label: 'Formeller' },
  { action: 'casual', label: 'Lockerer' },
]

const MODE_TABS: { value: InputMode; label: string }[] = [
  { value: 'topic', label: 'Thema' },
  { value: 'url', label: 'URL' },
  { value: 'job', label: 'Job' },
]

const DEFAULT_JOB_CONFIG: JobConfig = {
  hasExistingPosting: false,
  jobSubStyle: 'wir-suchen',
  candidatePersona: 'senior',
  industry: 'tech',
  remoteOption: false,
}

const formatTextInteractive = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

export default function PostGenerator({ initialState, onPostGenerated, onVersionsChange }: PostGeneratorProps) {
  const [mode, setMode] = useState<InputMode>(initialState?.mode ?? 'topic')
  const [topic, setTopic] = useState(initialState?.topic ?? '')
  const [url, setUrl] = useState(initialState?.url ?? '')
  const [jobConfig, setJobConfig] = useState<JobConfig>(initialState?.jobConfig ?? DEFAULT_JOB_CONFIG)
  const [tone, setTone] = useState<Tone>(initialState?.tone ?? 'professional')
  const [style, setStyle] = useState<Style>(initialState?.style ?? 'story')
  const [language, setLanguage] = useState<Language>(initialState?.language ?? 'de')
  const [copied, setCopied] = useState(false)
  const [showToneHelp, setShowToneHelp] = useState(false)
  const [showStyleHelp, setShowStyleHelp] = useState(false)
  const [customRefineText, setCustomRefineText] = useState('')

  const {
    output,
    loading,
    refining,
    error,
    versions,
    currentIndex,
    source,
    generate,
    refine,
    goToVersion,
    reset,
    loadContent,
    loadVersions,
    getSerializedVersions
  } = usePostGenerator()

  // Track if we're restoring from history (don't save restored items)
  const isRestoringRef = useRef(false)
  const lastSavedVersionIdRef = useRef<string | null>(null)

  // Handle initial state restoration from history
  useEffect(() => {
    if (initialState) {
      isRestoringRef.current = true
      setMode(initialState.mode)
      setTopic(initialState.topic)
      setUrl(initialState.url ?? '')
      setJobConfig(initialState.jobConfig ?? DEFAULT_JOB_CONFIG)
      setTone(initialState.tone)
      setStyle(initialState.style)
      setLanguage(initialState.language ?? 'de')
      if (initialState.versions && initialState.versions.length > 0) {
        loadVersions(initialState.versions)
      } else {
        loadContent(initialState.content, initialState.source)
      }
    }
  }, [initialState, loadContent, loadVersions])

  const handleGenerate = async () => {
    isRestoringRef.current = false
    await generate({ mode, topic, url, tone, style, language, jobConfig: mode === 'job' ? jobConfig : undefined })
  }

  const updateJobConfig = useCallback((updates: Partial<JobConfig>) => {
    setJobConfig(prev => ({ ...prev, ...updates }))
  }, [])

  // Trigger callback when a new post is generated (not restored)
  useEffect(() => {
    if (output && !loading && versions.length > 0 && onPostGenerated) {
      const latestVersion = versions[versions.length - 1]
      // Only save on initial generation, not refinements, and not when restoring
      if (
        latestVersion.action === 'generate' &&
        !isRestoringRef.current &&
        lastSavedVersionIdRef.current !== latestVersion.id
      ) {
        lastSavedVersionIdRef.current = latestVersion.id
        onPostGenerated({
          mode,
          topic,
          url: mode === 'url' ? url : (mode === 'job' && jobConfig.hasExistingPosting ? jobConfig.jobUrl : undefined),
          source: source ?? undefined,
          jobConfig: mode === 'job' ? jobConfig : undefined,
          tone,
          style,
          language,
          content: output,
          versions: getSerializedVersions(),
        })
      }
    }
  }, [output, loading, versions, mode, topic, url, jobConfig, source, tone, style, language, onPostGenerated])

  // Report version changes to parent
  useEffect(() => {
    if (!onVersionsChange) return
    if (versions.length > 0 && output) {
      onVersionsChange({ versions: getSerializedVersions(), content: output })
    } else {
      onVersionsChange(null)
    }
  }, [versions, output, onVersionsChange, getSerializedVersions])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setMode('topic')
    setTopic('')
    setUrl('')
    setJobConfig(DEFAULT_JOB_CONFIG)
    setTone('professional')
    setStyle('story')
    setLanguage('de')
    reset()
  }

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  const canGenerate = (() => {
    if (mode === 'topic') return !!topic.trim()
    if (mode === 'url') return url.trim() && isValidUrl(url)
    if (mode === 'job') {
      if (jobConfig.hasExistingPosting) {
        return jobConfig.jobUrl?.trim() && isValidUrl(jobConfig.jobUrl)
      }
      return !!jobConfig.jobTitle?.trim()
    }
    return false
  })()

  // Close help modals on Escape key
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
    <div className="min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2 relative">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
            LinkedIn Post Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Generiere professionelle LinkedIn-Posts mit KI in Sekunden.
          </p>
        </header>

        {/* Input Card */}
        <div className="glass-panel text-card-foreground transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.1)]">
          <div className="p-6 md:p-8 space-y-8">
            {/* Mode Tabs */}
            <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl w-fit backdrop-blur-md">
              {MODE_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setMode(tab.value)}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === tab.value
                    ? 'bg-white/20 text-foreground shadow-sm backdrop-blur-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Topic Textarea (mode=topic) */}
            {mode === 'topic' && (
              <div className="space-y-3">
                <label htmlFor="topic" className="text-sm font-medium leading-none text-foreground/80 pl-1">
                  Thema
                </label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Worüber möchtest du schreiben? (z.B. 'Die Zukunft von Remote Work')"
                  rows={4}
                  className="flex w-full rounded-2xl glass-input px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                />
              </div>
            )}

            {/* URL Input (mode=url) */}
            {mode === 'url' && (
              <div className="space-y-3">
                <label htmlFor="url" className="text-sm font-medium leading-none text-foreground/80 pl-1">
                  Artikel-URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/blog-artikel"
                  className={`flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${url && !isValidUrl(url)
                    ? 'border-destructive/50 ring-destructive/50 focus-visible:ring-destructive/50'
                    : ''
                    }`}
                />
                {url && !isValidUrl(url) && (
                  <p className="text-xs text-destructive">Bitte gib eine gültige URL ein (z.B. https://...)</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Füge eine Blog- oder Artikel-URL ein, um den Inhalt als LinkedIn-Post aufzubereiten.
                </p>
              </div>
            )}

            {/* Job Input (mode=job) */}
            {mode === 'job' && (
              <div className="space-y-6">
                {/* Has existing posting toggle */}
                <div className="space-y-3">
                  <label className="text-sm font-medium pl-1 text-foreground/80">Stellenausschreibung vorhanden?</label>
                  <div className="flex gap-3 p-1 rounded-2xl bg-secondary/20">
                    <button
                      type="button"
                      onClick={() => updateJobConfig({ hasExistingPosting: true })}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${jobConfig.hasExistingPosting
                        ? 'glass-button shadow-lg'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                        }`}
                    >
                      Ja, ich habe eine URL
                    </button>
                    <button
                      type="button"
                      onClick={() => updateJobConfig({ hasExistingPosting: false })}
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
                        onChange={e => updateJobConfig({ jobUrl: e.target.value })}
                        placeholder="https://careers.example.com/jobs/123"
                        className={`flex w-full h-10 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all ${jobConfig.jobUrl && !isValidUrl(jobConfig.jobUrl)
                          ? 'border-destructive focus-visible:ring-destructive'
                          : 'border-input'
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
                        onChange={e => setTopic(e.target.value)}
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
                          onChange={e => updateJobConfig({ jobTitle: e.target.value })}
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
                          onChange={e => updateJobConfig({ companyName: e.target.value })}
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
                        onChange={e => updateJobConfig({ benefits: e.target.value.split('\n').filter(Boolean) })}
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
                        onChange={e => updateJobConfig({ requirements: e.target.value.split('\n').filter(Boolean) })}
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
                        onChange={e => setTopic(e.target.value)}
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
                    <div className="relative">
                      <select
                        id="jobSubStyle"
                        value={jobConfig.jobSubStyle}
                        onChange={e => updateJobConfig({ jobSubStyle: e.target.value as JobSubStyle })}
                        className="flex h-12 w-full items-center justify-between rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                      >
                        {JOB_SUB_STYLE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground/70">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground pl-1">
                      {JOB_SUB_STYLE_OPTIONS.find(o => o.value === jobConfig.jobSubStyle)?.description}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="candidatePersona" className="text-sm font-medium pl-1 text-foreground/80">
                      Zielgruppe
                    </label>
                    <div className="relative">
                      <select
                        id="candidatePersona"
                        value={jobConfig.candidatePersona}
                        onChange={e => updateJobConfig({ candidatePersona: e.target.value as CandidatePersona })}
                        className="flex h-12 w-full items-center justify-between rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                      >
                        {CANDIDATE_PERSONA_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground/70">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
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
                    <div className="relative">
                      <select
                        id="industry"
                        value={jobConfig.industry}
                        onChange={e => updateJobConfig({ industry: e.target.value as Industry })}
                        className="flex h-12 w-full items-center justify-between rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                      >
                        {INDUSTRY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground/70">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="location" className="text-sm font-medium pl-1 text-foreground/80">
                      Standort
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={jobConfig.location || ''}
                      onChange={e => updateJobConfig({ location: e.target.value })}
                      placeholder="z.B. Berlin"
                      className="flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium pl-1 text-foreground/80">Remote möglich?</label>
                    <button
                      type="button"
                      onClick={() => updateJobConfig({ remoteOption: !jobConfig.remoteOption })}
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
            )}

            {/* Dropdowns Row */}
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
                <div className="relative">
                  <select
                    id="tone"
                    value={tone}
                    onChange={e => setTone(e.target.value as Tone)}
                    className="flex h-12 w-full items-center justify-between rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all cursor-pointer"
                  >
                    {TONE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground/70">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
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
                <div className="relative">
                  <select
                    id="style"
                    value={style}
                    onChange={e => setStyle(e.target.value as Style)}
                    className="flex h-12 w-full items-center justify-between rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all cursor-pointer"
                  >
                    {STYLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground/70">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="language" className="text-sm font-medium leading-none text-foreground/80 pl-1">
                  Sprache
                </label>
                <div className="relative">
                  <select
                    id="language"
                    value={language}
                    onChange={e => setLanguage(e.target.value as Language)}
                    className="flex h-12 w-full items-center justify-between rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all cursor-pointer"
                  >
                    {LANGUAGE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground/70">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !canGenerate}
              className={`flex w-full items-center justify-center rounded-2xl py-4 text-base font-semibold shadow-lg transition-all duration-300 ${loading || !canGenerate
                ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                  {mode === 'url' ? 'Lade Artikel...' : 'Generiere Post...'}
                </>
              ) : (
                'Post Generieren'
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-panel border-destructive/30 bg-destructive/10 text-destructive px-6 py-4 rounded-2xl text-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-2 shadow-lg">
            <div className="p-2 rounded-full bg-destructive/10 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-1 py-0.5">
              <p className="font-semibold">Ein Fehler ist aufgetreten</p>
              <p className="opacity-90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Tone Help Modal */}
        {showToneHelp && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={() => setShowToneHelp(false)}
          >
            <div
              className="glass-panel w-full max-w-lg mx-4 p-0 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold tracking-tight">Tonfall-Optionen</h3>
                <button
                  onClick={() => setShowToneHelp(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {TONE_OPTIONS.map(opt => (
                  <div key={opt.value} className="p-4 rounded-2xl bg-secondary/30 border border-white/5 hover:bg-secondary/50 transition-colors">
                    <div className="font-medium text-base mb-1 text-primary">{opt.label}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{TONE_DESCRIPTIONS[opt.value]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Style Help Modal */}
        {showStyleHelp && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={() => setShowStyleHelp(false)}
          >
            <div
              className="glass-panel w-full max-w-lg mx-4 p-0 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold tracking-tight">Stil-Optionen</h3>
                <button
                  onClick={() => setShowStyleHelp(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {STYLE_OPTIONS.map(opt => (
                  <div key={opt.value} className="p-4 rounded-2xl bg-secondary/30 border border-white/5 hover:bg-secondary/50 transition-colors">
                    <div className="font-medium text-base mb-1 text-primary">{opt.label}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{STYLE_DESCRIPTIONS[opt.value]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Version Navigation */}
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Ergebnis</h2>
              <div className="flex items-center gap-3 bg-secondary/30 p-1.5 rounded-xl backdrop-blur-md border border-white/5">
                <button
                  onClick={() => goToVersion(currentIndex - 1)}
                  disabled={currentIndex <= 0 || !!refining}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Vorherige Version"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-muted-foreground w-20 text-center select-none font-mono">
                  V{currentIndex + 1} / {versions.length}
                </span>
                <button
                  onClick={() => goToVersion(currentIndex + 1)}
                  disabled={currentIndex >= versions.length - 1 || !!refining}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Nächste Version"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Display */}
            <div className="glass-panel overflow-hidden shadow-lg">
              <div
                className="p-6 md:p-8 whitespace-pre-wrap leading-relaxed text-foreground/90 font-outfit text-lg"
                dangerouslySetInnerHTML={{
                  __html: formatTextInteractive(output)
                }}
              />

              {/* Source Badge (URL Mode) */}
              {source && (
                <div className="px-6 py-3 bg-white/5 border-t border-white/5 text-xs text-muted-foreground flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider opacity-70">Quelle:</span>
                  <div className="flex items-center gap-2 truncate">
                    {source.favicon && <img src={source.favicon} alt="" className="w-4 h-4 rounded-sm opacity-70" />}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:text-primary/80 hover:underline truncate max-w-xs transition-colors"
                    >
                      {source.title}
                    </a>
                  </div>
                </div>
              )}

              {/* Metada & Actions footer */}
              <div className="bg-muted/30 px-6 py-6 border-t border-white/5 flex flex-col gap-6">
                <div className="flex justify-between items-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>{output.length} Zeichen</span>
                  <span>{loading ? 'Generiere...' : 'Fertig'}</span>
                </div>

                {/* Refine Options Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Verfeinern</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {REFINE_OPTIONS.map(({ action, label }) => (
                      <button
                        key={action}
                        onClick={() => refine(action, undefined, { tone, style, language })}
                        disabled={!!refining || loading}
                        className="glass-button h-10 px-4 text-xs font-medium hover:scale-[1.02] active:scale-[0.98]"
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
                      if (e.key === 'Enter' && customRefineText.trim() && !refining && !loading) {
                        refine('custom', customRefineText, { tone, style, language })
                        setCustomRefineText('')
                      }
                    }}
                    placeholder="z.B. Mehr Emojis hinzufügen..."
                    disabled={!!refining || loading}
                    className="flex-1 h-11 rounded-xl glass-input px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  />
                  <button
                    onClick={() => {
                      if (customRefineText.trim()) {
                        refine('custom', customRefineText, { tone, style, language })
                        setCustomRefineText('')
                      }
                    }}
                    disabled={!customRefineText.trim() || !!refining || loading}
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

                {/* Primary Actions */}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleCopy}
                    disabled={!!refining}
                    className={`flex-1 flex items-center justify-center rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 h-12 px-6 ${copied
                      ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/30'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Kopieren
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={!!refining}
                    className="flex-1 flex items-center justify-center rounded-xl text-sm font-medium glass-button h-12 px-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-all duration-300"
                  >
                    Neu starten
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
