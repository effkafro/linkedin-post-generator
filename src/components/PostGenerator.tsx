import { useState, useEffect, useRef } from 'react'
import { usePostGenerator, type Tone, type Style, type RefineAction } from '../hooks/usePostGenerator'

export interface PostGeneratorProps {
  initialState?: {
    topic: string
    tone: Tone
    style: Style
    content: string
  }
  onPostGenerated?: (data: { topic: string; tone: Tone; style: Style; content: string }) => void
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

const REFINE_OPTIONS: { action: RefineAction; label: string }[] = [
  { action: 'shorter', label: 'Kürzer' },
  { action: 'longer', label: 'Länger' },
  { action: 'formal', label: 'Formeller' },
  { action: 'casual', label: 'Lockerer' },
]

export default function PostGenerator({ initialState, onPostGenerated }: PostGeneratorProps) {
  const [topic, setTopic] = useState(initialState?.topic ?? '')
  const [tone, setTone] = useState<Tone>(initialState?.tone ?? 'professional')
  const [style, setStyle] = useState<Style>(initialState?.style ?? 'story')
  const [copied, setCopied] = useState(false)

  const {
    output,
    loading,
    refining,
    error,
    versions,
    currentIndex,
    generate,
    refine,
    goToVersion,
    reset,
    loadContent
  } = usePostGenerator()

  // Track if we're restoring from history (don't save restored items)
  const isRestoringRef = useRef(false)
  const lastSavedVersionIdRef = useRef<string | null>(null)

  // Handle initial state restoration from history
  useEffect(() => {
    if (initialState) {
      isRestoringRef.current = true
      setTopic(initialState.topic)
      setTone(initialState.tone)
      setStyle(initialState.style)
      loadContent(initialState.content)
    }
  }, [initialState, loadContent])

  const handleGenerate = async () => {
    isRestoringRef.current = false
    await generate({ topic, tone, style })
  }

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
        onPostGenerated({ topic, tone, style, content: output })
      }
    }
  }, [output, loading, versions, topic, tone, style, onPostGenerated])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setTopic('')
    setTone('professional')
    setStyle('story')
    reset()
  }

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
        <div className="bg-card text-card-foreground shadow-sm border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="p-6 md:p-8 space-y-6">
            {/* Topic Textarea */}
            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Thema
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Worüber möchtest du schreiben? (z.B. 'Die Zukunft von Remote Work')"
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
              />
            </div>

            {/* Dropdowns Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="tone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Tonfall
                </label>
                <div className="relative">
                  <select
                    id="tone"
                    value={tone}
                    onChange={e => setTone(e.target.value as Tone)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all cursor-pointer"
                  >
                    {TONE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="style" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Stil
                </label>
                <div className="relative">
                  <select
                    id="style"
                    value={style}
                    onChange={e => setStyle(e.target.value as Style)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all cursor-pointer"
                  >
                    {STYLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full shadow-md"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                  Generiere Post...
                </>
              ) : (
                'Post Generieren'
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Version Navigation */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-foreground">Ergebnis</h2>
              <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
                <button
                  onClick={() => goToVersion(currentIndex - 1)}
                  disabled={currentIndex <= 0 || !!refining}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Vorherige Version"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs font-medium text-muted-foreground w-16 text-center select-none">
                  V{currentIndex + 1} / {versions.length}
                </span>
                <button
                  onClick={() => goToVersion(currentIndex + 1)}
                  disabled={currentIndex >= versions.length - 1 || !!refining}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Nächste Version"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-card text-card-foreground shadow-sm border border-border rounded-xl overflow-hidden">
              {/* Post Content */}
              <div className="p-6 md:p-8 bg-card">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-base">{output}</p>
                </div>
              </div>

              {/* Metada & Actions footer */}
              <div className="bg-muted/30 px-6 py-4 border-t border-border flex flex-col gap-4">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{output.length} Zeichen</span>
                  <span>{loading ? 'Generiere...' : 'Fertig'}</span>
                </div>

                {/* Refine Options Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {REFINE_OPTIONS.map(({ action, label }) => (
                    <button
                      key={action}
                      onClick={() => refine(action)}
                      disabled={!!refining || loading}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                    >
                      {refining === action ? (
                        <span className="animate-spin mr-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </span>
                      ) : null}
                      {label}
                    </button>
                  ))}
                </div>

                {/* Primary Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCopy}
                    disabled={!!refining}
                    className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${copied
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Kopiert!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Kopieren
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={!!refining}
                    className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
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
