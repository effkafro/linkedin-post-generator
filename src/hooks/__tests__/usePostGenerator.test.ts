import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePostGenerator } from '../usePostGenerator'
import type { SerializedPostVersion } from '../../types/post'

// Webhook-URL mocken
vi.stubEnv('VITE_WEBHOOK_URL', 'https://test-webhook.example.com/hook')

// crypto.randomUUID Mock
let uuidCounter = 0
vi.stubGlobal('crypto', {
  randomUUID: () => `mock-uuid-${++uuidCounter}`,
})

// Globales fetch Mock
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

function createFetchResponse(data: Record<string, unknown>, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Error',
    type: 'basic',
    url: '',
    clone: () => ({}) as Response,
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
    bytes: () => Promise.resolve(new Uint8Array()),
  } as Response
}

describe('usePostGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    uuidCounter = 0
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Hilfsfunktion: Cooldown ablaufen lassen
  function clearCooldown() {
    act(() => {
      vi.advanceTimersByTime(5000)
    })
  }

  describe('Initialer State', () => {
    it('hat korrekten initialen State', () => {
      const { result } = renderHook(() => usePostGenerator())

      expect(result.current.output).toBe('')
      expect(result.current.loading).toBe(false)
      expect(result.current.refining).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.cooldown).toBe(false)
      expect(result.current.versions).toEqual([])
      expect(result.current.currentIndex).toBe(-1)
      expect(result.current.source).toBeNull()
    })
  })

  describe('generate', () => {
    it('setzt loading und ruft fetch auf', async () => {
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: 'Generierter Post' })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'KI im Recruiting',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(result.current.output).toBe('Generierter Post')
      expect(result.current.loading).toBe(false)
      expect(result.current.versions).toHaveLength(1)
      expect(result.current.currentIndex).toBe(0)
    })

    it('parsed die Response mit Source korrekt (Zod-Validierung)', async () => {
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({
          output: 'Post mit Quelle',
          source: { url: 'https://example.com', title: 'Quelle', excerpt: 'Auszug' },
        })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'url',
          topic: '',
          url: 'https://example.com',
          tone: 'casual',
          style: 'listicle',
          language: 'en',
        })
      })

      expect(result.current.output).toBe('Post mit Quelle')
      expect(result.current.source).toEqual({ url: 'https://example.com', title: 'Quelle', excerpt: 'Auszug' })
    })

    it('aktiviert Cooldown nach erfolgreichem Generate', async () => {
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: 'Post' })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      expect(result.current.cooldown).toBe(true)

      // Nach 5 Sekunden ist Cooldown vorbei
      clearCooldown()
      expect(result.current.cooldown).toBe(false)
    })

    it('blockiert generate während Cooldown', async () => {
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: 'Post' })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      // Zweiter Versuch während Cooldown
      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Zweiter Versuch',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      expect(result.current.error).toBe('Bitte warte kurz bevor du erneut generierst.')
      expect(fetchMock).toHaveBeenCalledOnce() // Nur der erste Call
    })

    it('zeigt Fehler bei leerem Topic im Topic-Modus', async () => {
      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: '',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      expect(result.current.error).toBe('Bitte gib ein Thema ein.')
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('zeigt Fehler bei leerer URL im URL-Modus', async () => {
      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'url',
          topic: '',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      expect(result.current.error).toBe('Bitte gib eine URL ein.')
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('zeigt Fehler bei ungültiger URL', async () => {
      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'url',
          topic: '',
          url: 'keine-url',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      expect(result.current.error).toBe('Bitte gib eine gültige URL ein.')
    })

    it('behandelt Fetch-Fehler', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      expect(result.current.error).toBe('Fehler bei der Verbindung zum Server. Bitte versuche es erneut.')
      expect(result.current.loading).toBe(false)
    })

    it('behandelt HTTP-Fehler', async () => {
      fetchMock.mockResolvedValueOnce(createFetchResponse({}, false, 500))

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      expect(result.current.error).toBe('Fehler bei der Verbindung zum Server. Bitte versuche es erneut.')
    })

    it('setzt "Keine Antwort erhalten." bei leerem Output', async () => {
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: '' })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      expect(result.current.output).toBe('Keine Antwort erhalten.')
    })
  })

  describe('refine', () => {
    it('sendet aktuellen Output an Webhook', async () => {
      // Erst generieren
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: 'Erster Post' })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      // Cooldown ablaufen lassen
      clearCooldown()

      // Dann refinen
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: 'Kürzerer Post' })
      )

      await act(async () => {
        await result.current.refine('shorter')
      })

      expect(result.current.output).toBe('Kürzerer Post')
      expect(result.current.versions).toHaveLength(2)
      expect(result.current.currentIndex).toBe(1)
    })

    it('zeigt Fehler wenn kein Post vorhanden', async () => {
      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.refine('shorter')
      })

      expect(result.current.error).toBe('Kein Post zum Bearbeiten vorhanden.')
    })

    it('zeigt Fehler bei custom ohne Anweisung', async () => {
      // Erst generieren
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: 'Post' })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      // Cooldown ablaufen lassen
      clearCooldown()

      await act(async () => {
        await result.current.refine('custom', '')
      })

      expect(result.current.error).toBe('Bitte gib eine Anweisung ein.')
    })
  })

  describe('goToVersion', () => {
    it('navigiert zwischen Versionen', async () => {
      fetchMock
        .mockResolvedValueOnce(createFetchResponse({ output: 'Version 1' }))
        .mockResolvedValueOnce(createFetchResponse({ output: 'Version 2' }))

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      // Cooldown ablaufen lassen vor refine
      clearCooldown()

      await act(async () => {
        await result.current.refine('shorter')
      })

      expect(result.current.output).toBe('Version 2')

      act(() => {
        result.current.goToVersion(0)
      })

      expect(result.current.output).toBe('Version 1')
      expect(result.current.currentIndex).toBe(0)
    })

    it('ignoriert ungültige Indizes', async () => {
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: 'Post' })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      act(() => {
        result.current.goToVersion(99)
      })

      // Index bleibt bei 0
      expect(result.current.currentIndex).toBe(0)

      act(() => {
        result.current.goToVersion(-1)
      })

      expect(result.current.currentIndex).toBe(0)
    })
  })

  describe('reset', () => {
    it('setzt alles auf den initialen State zurück', async () => {
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: 'Post' })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.output).toBe('')
      expect(result.current.versions).toEqual([])
      expect(result.current.currentIndex).toBe(-1)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadContent', () => {
    it('lädt Content als neue Version', () => {
      const { result } = renderHook(() => usePostGenerator())

      act(() => {
        result.current.loadContent('Externer Content')
      })

      expect(result.current.output).toBe('Externer Content')
      expect(result.current.versions).toHaveLength(1)
      expect(result.current.currentIndex).toBe(0)
    })

    it('lädt Content mit Source-Info', () => {
      const { result } = renderHook(() => usePostGenerator())

      act(() => {
        result.current.loadContent('Content', { url: 'https://example.com', title: 'Quelle', excerpt: 'Auszug' })
      })

      expect(result.current.source).toEqual({ url: 'https://example.com', title: 'Quelle', excerpt: 'Auszug' })
    })
  })

  describe('loadVersions', () => {
    it('restauriert serialisierte Versionen', () => {
      const serialized: SerializedPostVersion[] = [
        { id: 'v1', content: 'Version 1', timestamp: '2026-01-01T00:00:00Z', action: 'generate' },
        { id: 'v2', content: 'Version 2', timestamp: '2026-01-01T01:00:00Z', action: 'shorter' },
      ]

      const { result } = renderHook(() => usePostGenerator())

      act(() => {
        result.current.loadVersions(serialized)
      })

      expect(result.current.versions).toHaveLength(2)
      expect(result.current.output).toBe('Version 2')
      expect(result.current.currentIndex).toBe(1)
      // Timestamp wurde zu Date konvertiert
      expect(result.current.versions[0].timestamp).toBeInstanceOf(Date)
    })

    it('ignoriert leeres Array', () => {
      const { result } = renderHook(() => usePostGenerator())

      act(() => {
        result.current.loadVersions([])
      })

      expect(result.current.versions).toEqual([])
      expect(result.current.currentIndex).toBe(-1)
    })
  })

  describe('getSerializedVersions', () => {
    it('serialisiert Versionen korrekt', async () => {
      fetchMock.mockResolvedValueOnce(
        createFetchResponse({ output: 'Post' })
      )

      const { result } = renderHook(() => usePostGenerator())

      await act(async () => {
        await result.current.generate({
          mode: 'topic',
          topic: 'Test',
          url: '',
          tone: 'professional',
          style: 'story',
          language: 'de',
        })
      })

      const serialized = result.current.getSerializedVersions()
      expect(serialized).toHaveLength(1)
      expect(serialized[0].content).toBe('Post')
      expect(typeof serialized[0].timestamp).toBe('string')
      expect(serialized[0].action).toBe('generate')
    })
  })
})
