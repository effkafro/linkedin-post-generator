import { useState, useCallback, useRef, useEffect } from 'react'
import type { InputMode, Tone, Style, Language, RefineAction, PostVersion, SerializedPostVersion, StoryPoint } from '../types/post'
import type { JobConfig } from '../types/job'
import type { SourceInfo } from '../types/source'
import type { ProfilePayload } from '../types/profile'
import { REFINE_PROMPTS } from '../constants/refine'
import { generateResponseSchema } from '../schemas/api'

// Re-export types for backward compatibility during migration
export type { Tone, Style, Language, RefineAction, PostVersion }
export type { JobSubStyle, CandidatePersona, Industry } from '../types/job'

interface GenerateParams {
  mode: InputMode
  topic: string
  url: string
  tone: Tone
  style: Style
  language: Language
  jobConfig?: JobConfig
  profile?: ProfilePayload
  storyPoints?: StoryPoint[]
}

interface UsePostGeneratorReturn {
  output: string
  loading: boolean
  refining: RefineAction | null
  error: string | null
  cooldown: boolean
  versions: PostVersion[]
  currentIndex: number
  source: SourceInfo | null
  generate: (params: GenerateParams) => Promise<void>
  refine: (action: RefineAction, customInstruction?: string, settings?: { tone: Tone; style: Style; language: Language }, profile?: ProfilePayload) => Promise<void>
  goToVersion: (index: number) => void
  reset: () => void
  loadContent: (content: string, source?: SourceInfo) => void
  loadVersions: (serialized: SerializedPostVersion[]) => void
  getSerializedVersions: () => SerializedPostVersion[]
}

export function usePostGenerator(): UsePostGeneratorReturn {
  const [versions, setVersions] = useState<PostVersion[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [refining, setRefining] = useState<RefineAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(false)
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current)
      }
    }
  }, [])

  const startCooldown = useCallback(() => {
    setCooldown(true)
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current)
    }
    cooldownTimerRef.current = setTimeout(() => {
      setCooldown(false)
      cooldownTimerRef.current = null
    }, 5000)
  }, [])

  const output = currentIndex >= 0 && versions[currentIndex] ? versions[currentIndex].content : ''
  const source = currentIndex >= 0 && versions[currentIndex] ? versions[currentIndex].source || null : null

  const addVersion = useCallback((content: string, action: 'generate' | RefineAction, sourceInfo?: SourceInfo) => {
    const newVersion: PostVersion = {
      id: crypto.randomUUID(),
      content,
      timestamp: new Date(),
      action,
      source: sourceInfo,
    }
    setVersions(prev => [...prev, newVersion])
    setCurrentIndex(prev => prev + 1)
  }, [])

  const generate = useCallback(async ({ mode, topic, url, tone, style, language, jobConfig, profile, storyPoints }: GenerateParams) => {
    if (cooldown) {
      setError('Bitte warte kurz bevor du erneut generierst.')
      return
    }

    if (mode === 'topic' && !storyPoints && !topic.trim()) {
      setError('Bitte gib ein Thema ein.')
      return
    }
    if (mode === 'topic' && storyPoints && !storyPoints.some(sp => sp.content.trim())) {
      setError('Bitte fülle mindestens einen Story-Punkt aus.')
      return
    }
    if (mode === 'url' && !url.trim()) {
      setError('Bitte gib eine URL ein.')
      return
    }
    if (mode === 'url') {
      try {
        new URL(url)
      } catch {
        setError('Bitte gib eine gültige URL ein.')
        return
      }
    }
    if (mode === 'job') {
      if (jobConfig?.hasExistingPosting && !jobConfig.jobUrl?.trim()) {
        setError('Bitte gib die URL zur Stellenausschreibung ein.')
        return
      }
      if (!jobConfig?.hasExistingPosting && !jobConfig?.jobTitle?.trim()) {
        setError('Bitte gib einen Jobtitel ein.')
        return
      }
    }

    setLoading(true)
    setError(null)
    setVersions([])
    setCurrentIndex(-1)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const res = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, topic, url, tone, style, language, jobConfig, profile, storyPoints }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: unknown = await res.json()

      // Zod-Validierung der Response-Struktur
      const parsed = generateResponseSchema.safeParse(data)
      if (!parsed.success) {
        throw new Error('Ungültiges Response-Format')
      }

      const content = parsed.data.output.trim() || 'Keine Antwort erhalten.'
      const sourceInfo: SourceInfo | undefined = parsed.data.source ?? undefined

      const newVersion: PostVersion = {
        id: crypto.randomUUID(),
        content,
        timestamp: new Date(),
        action: 'generate',
        source: sourceInfo,
      }
      setVersions([newVersion])
      setCurrentIndex(0)
      startCooldown()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Zeitüberschreitung — der Server antwortet nicht. Bitte versuche es erneut.')
      } else {
        setError('Fehler bei der Verbindung zum Server. Bitte versuche es erneut.')
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [cooldown, startCooldown])

  const refine = useCallback(async (action: RefineAction, customInstruction?: string, settings?: { tone: Tone; style: Style; language: Language }, profile?: ProfilePayload) => {
    if (cooldown) {
      setError('Bitte warte kurz vor der nächsten Anfrage.')
      return
    }

    if (!output) {
      setError('Kein Post zum Bearbeiten vorhanden.')
      return
    }

    if (action === 'custom' && !customInstruction?.trim()) {
      setError('Bitte gib eine Anweisung ein.')
      return
    }

    setRefining(action)
    setError(null)

    const prompt = action === 'custom'
      ? `Überarbeite diesen LinkedIn-Post nach folgender Anweisung:\n\nANWEISUNG: ${customInstruction}\n\nPOST:\n${output}`
      : `${REFINE_PROMPTS[action]}\n\n${output}`

    // Use provided settings or defaults
    const tone = settings?.tone ?? 'professional'
    const style = settings?.style ?? 'story'
    const language = settings?.language ?? 'de'

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const res = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'topic', topic: prompt, url: '', tone, style, language, profile }),
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: unknown = await res.json()

      // Zod-Validierung der Response-Struktur
      const parsed = generateResponseSchema.safeParse(data)
      if (!parsed.success) {
        throw new Error('Ungültiges Response-Format')
      }

      const content = parsed.data.output.trim() || 'Keine Antwort erhalten.'

      addVersion(content, action, source || undefined)
      startCooldown()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Zeitüberschreitung — der Server antwortet nicht. Bitte versuche es erneut.')
      } else {
        setError('Fehler bei der Bearbeitung. Bitte versuche es erneut.')
      }
    } finally {
      clearTimeout(timeoutId)
      setRefining(null)
    }
  }, [output, source, addVersion, cooldown, startCooldown])

  const goToVersion = useCallback((index: number) => {
    if (index >= 0 && index < versions.length) {
      setCurrentIndex(index)
    }
  }, [versions.length])

  const reset = useCallback(() => {
    setVersions([])
    setCurrentIndex(-1)
    setError(null)
  }, [])

  const loadContent = useCallback((content: string, sourceInfo?: SourceInfo) => {
    const newVersion: PostVersion = {
      id: crypto.randomUUID(),
      content,
      timestamp: new Date(),
      action: 'generate',
      source: sourceInfo,
    }
    setVersions([newVersion])
    setCurrentIndex(0)
    setError(null)
  }, [])

  const loadVersions = useCallback((serialized: SerializedPostVersion[]) => {
    if (serialized.length === 0) return
    const restored: PostVersion[] = serialized.map(v => ({
      id: v.id,
      content: v.content,
      timestamp: new Date(v.timestamp),
      action: v.action,
      source: v.source,
    }))
    setVersions(restored)
    setCurrentIndex(restored.length - 1)
    setError(null)
  }, [])

  const getSerializedVersions = useCallback((): SerializedPostVersion[] => {
    return versions.map(v => ({
      id: v.id,
      content: v.content,
      timestamp: v.timestamp.toISOString(),
      action: v.action,
      source: v.source,
    }))
  }, [versions])

  return {
    output,
    loading,
    refining,
    error,
    cooldown,
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
  }
}
