import { useState, useCallback } from 'react'
import type { InputMode, SourceInfo } from '../types/history'

export type Tone = 'professional' | 'casual' | 'inspirational' | 'educational'
export type Style = 'story' | 'listicle' | 'question-hook' | 'bold-statement'
export type Language = 'de' | 'en' | 'fr' | 'es' | 'it'
export type RefineAction = 'shorter' | 'longer' | 'formal' | 'casual'

interface GenerateParams {
  mode: InputMode
  topic: string
  url: string
  tone: Tone
  style: Style
  language: Language
}

interface PostVersion {
  id: string
  content: string
  timestamp: Date
  action: 'generate' | RefineAction
  source?: SourceInfo
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
  refine: (action: RefineAction) => Promise<void>
  goToVersion: (index: number) => void
  reset: () => void
  loadContent: (content: string, source?: SourceInfo) => void
}

const REFINE_PROMPTS: Record<RefineAction, string> = {
  shorter: "Kürze diesen LinkedIn-Post auf maximal 800 Zeichen. Behalte den Kern der Aussage:",
  longer: "Erweitere diesen LinkedIn-Post mit mehr Details und Beispielen (max 1800 Zeichen):",
  formal: "Formuliere diesen LinkedIn-Post professioneller und formeller um:",
  casual: "Formuliere diesen LinkedIn-Post lockerer und persönlicher um:",
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

  const generate = useCallback(async ({ mode, topic, url, tone, style, language }: GenerateParams) => {
    if (mode === 'topic' && !topic.trim()) {
      setError('Bitte gib ein Thema ein.')
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

    setLoading(true)
    setError(null)
    setVersions([])
    setCurrentIndex(-1)

    try {
      const res = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, topic, url, tone, style, language }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      const content = data.output || 'Keine Antwort erhalten.'
      const sourceInfo: SourceInfo | undefined = data.source

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

  const refine = useCallback(async (action: RefineAction) => {
    if (!output) {
      setError('Kein Post zum Bearbeiten vorhanden.')
      return
    }

    setRefining(action)
    setError(null)

    const prompt = `${REFINE_PROMPTS[action]}\n\n${output}`

    try {
      const res = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'topic', topic: prompt, url: '', tone: 'professional', style: 'story' }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      const content = data.output || 'Keine Antwort erhalten.'
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
    loadContent
  }
}
