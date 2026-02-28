import { useState, useCallback } from 'react'
import type { InputMode, Tone, Style, Language, RefineAction, PostVersion, SerializedPostVersion, StoryPoint } from '../types/post'
import type { JobConfig } from '../types/job'
import type { SourceInfo } from '../types/source'
import type { ProfilePayload } from '../types/profile'
import { REFINE_PROMPTS } from '../constants/refine'

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

    try {
      const res = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, topic, url, tone, style, language, jobConfig, profile, storyPoints }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      // Validate response structure
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid response format')
      }

      const content = typeof data.output === 'string' && data.output.trim()
        ? data.output
        : 'Keine Antwort erhalten.'

      // Validate source if present
      const sourceInfo: SourceInfo | undefined = data.source && typeof data.source === 'object'
        && typeof data.source.url === 'string' && typeof data.source.title === 'string'
        ? data.source as SourceInfo
        : undefined

      const newVersion: PostVersion = {
        id: crypto.randomUUID(),
        content,
        timestamp: new Date(),
        action: 'generate',
        source: sourceInfo,
      }
      setVersions([newVersion])
      setCurrentIndex(0)
    } catch {
      setError('Fehler bei der Verbindung zum Server. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }, [])

  const refine = useCallback(async (action: RefineAction, customInstruction?: string, settings?: { tone: Tone; style: Style; language: Language }, profile?: ProfilePayload) => {
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

    try {
      const res = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'topic', topic: prompt, url: '', tone, style, language, profile }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      // Validate response structure
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid response format')
      }

      const content = typeof data.output === 'string' && data.output.trim()
        ? data.output
        : 'Keine Antwort erhalten.'

      addVersion(content, action, source || undefined)
    } catch {
      setError('Fehler bei der Bearbeitung. Bitte versuche es erneut.')
    } finally {
      setRefining(null)
    }
  }, [output, source, addVersion])

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
