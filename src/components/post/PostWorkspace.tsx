import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { usePostGenerator } from '../../hooks/usePostGenerator'
import { useProfileContext } from '../../contexts/ProfileContext'
import { useAuth } from '../../contexts/AuthContext'
import type { InputMode, Tone, Style, Language, RefineAction, SerializedPostVersion } from '../../types/post'
import type { JobConfig } from '../../types/job'
import type { SourceInfo } from '../../types/source'
import { DEFAULT_JOB_CONFIG } from '../../constants/job'
import { buildProfilePayload } from '../../utils/buildProfilePayload'
import InputPanel from './input/InputPanel'
import OutputPanel from './output/OutputPanel'

export interface PostWorkspaceProps {
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

export default function PostWorkspace({ initialState, onPostGenerated, onVersionsChange }: PostWorkspaceProps) {
  const [mode, setMode] = useState<InputMode>(initialState?.mode ?? 'topic')
  const [topic, setTopic] = useState(initialState?.topic ?? '')
  const [url, setUrl] = useState(initialState?.url ?? '')
  const [jobConfig, setJobConfig] = useState<JobConfig>(initialState?.jobConfig ?? DEFAULT_JOB_CONFIG)
  const [tone, setTone] = useState<Tone>(initialState?.tone ?? 'professional')
  const [style, setStyle] = useState<Style>(initialState?.style ?? 'story')
  const [language, setLanguage] = useState<Language>(initialState?.language ?? 'de')

  const { user } = useAuth()
  const { profile: voiceProfile, examplePosts, completeness } = useProfileContext()

  const [useProfile, setUseProfile] = useState(() =>
    localStorage.getItem('use-profile-context') === 'true'
  )

  const profileAvailable = !!user && !!voiceProfile
  const profilePayload = useMemo(() => {
    if (!useProfile || !voiceProfile) return undefined
    return buildProfilePayload(voiceProfile, examplePosts)
  }, [useProfile, voiceProfile, examplePosts])

  const handleUseProfileChange = useCallback((enabled: boolean) => {
    setUseProfile(enabled)
    localStorage.setItem('use-profile-context', String(enabled))
  }, [])

  const {
    output, loading, refining, error, versions, currentIndex, source,
    generate, refine, goToVersion, reset, loadContent, loadVersions, getSerializedVersions,
  } = usePostGenerator()

  // Track if we're restoring from history (don't save restored items)
  const isRestoringRef = useRef(false)
  const lastSavedVersionIdRef = useRef<string | null>(null)
  const initialLoadedRef = useRef<string | null>(null)

  // Handle initial state restoration from history
  useEffect(() => {
    if (!initialState) return
    // Only load when the history item actually changed
    const stateKey = initialState.versions?.[0]?.id ?? initialState.content.slice(0, 50)
    if (initialLoadedRef.current === stateKey) return
    initialLoadedRef.current = stateKey

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
  }, [initialState, loadContent, loadVersions])

  const handleGenerate = async () => {
    isRestoringRef.current = false
    await generate({ mode, topic, url, tone, style, language, jobConfig: mode === 'job' ? jobConfig : undefined, profile: profilePayload })
  }

  const handleRefine = useCallback((action: RefineAction, customInstruction?: string, settings?: { tone: Tone; style: Style; language: Language }) => {
    return refine(action, customInstruction, settings, profilePayload)
  }, [refine, profilePayload])

  const updateJobConfig = useCallback((updates: Partial<JobConfig>) => {
    setJobConfig(prev => ({ ...prev, ...updates }))
  }, [])

  // Trigger callback when a new post is generated (not restored)
  useEffect(() => {
    if (output && !loading && versions.length > 0 && onPostGenerated) {
      const latestVersion = versions[versions.length - 1]
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

  return (
    <div className="min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 relative animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            <span className="text-gradient">Content Creator</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Generiere professionelle Posts mit KI in Sekunden.
          </p>
        </header>

        <InputPanel
          mode={mode} topic={topic} url={url} jobConfig={jobConfig}
          tone={tone} style={style} language={language} loading={loading}
          onModeChange={setMode} onTopicChange={setTopic} onUrlChange={setUrl}
          onJobConfigChange={updateJobConfig}
          onToneChange={setTone} onStyleChange={setStyle} onLanguageChange={setLanguage}
          onGenerate={handleGenerate}
          useProfile={useProfile}
          onUseProfileChange={handleUseProfileChange}
          profileAvailable={profileAvailable}
          profileCompleteness={completeness}
        />

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

        <OutputPanel
          output={output} source={source}
          currentIndex={currentIndex} totalVersions={versions.length}
          tone={tone} style={style} language={language}
          refining={refining} loading={loading}
          onGoToVersion={goToVersion} onRefine={handleRefine} onReset={handleReset}
        />
      </div>
    </div>
  )
}
