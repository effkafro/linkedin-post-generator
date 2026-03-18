import { describe, it, expect, beforeEach, vi } from 'vitest'
import { localStorageAdapter, clearLocalStorage } from '../localStorageAdapter'
import type { HistoryItem } from '../../../types/history'
import type { NewHistoryItem } from '../types'

// localStorage Mock mit Map-basierter Implementierung
const storageMap = new Map<string, string>()

const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => storageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storageMap.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
    storageMap.delete(key)
  }),
  clear: vi.fn(() => {
    storageMap.clear()
  }),
  get length() {
    return storageMap.size
  },
  key: vi.fn((index: number) => {
    const keys = Array.from(storageMap.keys())
    return keys[index] ?? null
  }),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// crypto.randomUUID Mock
let uuidCounter = 0
vi.stubGlobal('crypto', {
  randomUUID: () => `test-uuid-${++uuidCounter}`,
})

function createTestItem(overrides: Partial<NewHistoryItem> = {}): NewHistoryItem {
  return {
    mode: 'topic',
    topic: 'Test Thema',
    tone: 'professional',
    style: 'story',
    language: 'de',
    content: 'Test Inhalt',
    ...overrides,
  }
}

function createStoredItem(overrides: Partial<HistoryItem> = {}): HistoryItem {
  return {
    id: 'existing-id',
    mode: 'topic',
    topic: 'Gespeichertes Thema',
    tone: 'professional',
    style: 'story',
    language: 'de',
    content: 'Gespeicherter Inhalt',
    createdAt: '2026-01-01T00:00:00.000Z',
    charCount: 20,
    ...overrides,
  }
}

describe('localStorageAdapter', () => {
  beforeEach(() => {
    storageMap.clear()
    vi.clearAllMocks()
    uuidCounter = 0
  })

  describe('loadHistory', () => {
    it('gibt leeres Array zurück wenn localStorage leer ist', async () => {
      const result = await localStorageAdapter.loadHistory()
      expect(result).toEqual([])
    })

    it('lädt gespeicherte Items aus localStorage', async () => {
      const items = [createStoredItem()]
      storageMap.set('linkedin-post-history', JSON.stringify(items))

      const result = await localStorageAdapter.loadHistory()
      expect(result).toHaveLength(1)
      expect(result[0].topic).toBe('Gespeichertes Thema')
    })

    it('setzt Default-Werte für mode und language', async () => {
      // Alte Items ohne mode/language Felder
      const items = [{ ...createStoredItem(), mode: undefined, language: undefined }]
      storageMap.set('linkedin-post-history', JSON.stringify(items))

      const result = await localStorageAdapter.loadHistory()
      expect(result[0].mode).toBe('topic')
      expect(result[0].language).toBe('de')
    })
  })

  describe('addItem', () => {
    it('fügt ein neues Item hinzu', async () => {
      const item = createTestItem()
      const result = await localStorageAdapter.addItem(undefined, item)

      expect(result).not.toBeNull()
      expect(result!.id).toBe('test-uuid-1')
      expect(result!.content).toBe('Test Inhalt')
      expect(result!.charCount).toBe(item.content.length)
    })

    it('stellt neues Item an den Anfang', async () => {
      const existing = [createStoredItem({ id: 'alt' })]
      storageMap.set('linkedin-post-history', JSON.stringify(existing))

      await localStorageAdapter.addItem(undefined, createTestItem({ content: 'Neu' }))

      const stored = JSON.parse(storageMap.get('linkedin-post-history')!) as HistoryItem[]
      expect(stored[0].content).toBe('Neu')
      expect(stored[1].id).toBe('alt')
    })

    it('respektiert MAX_ENTRIES Limit von 50', async () => {
      // 50 bestehende Items erstellen
      const existing = Array.from({ length: 50 }, (_, i) =>
        createStoredItem({ id: `item-${i}` })
      )
      storageMap.set('linkedin-post-history', JSON.stringify(existing))

      await localStorageAdapter.addItem(undefined, createTestItem())

      const stored = JSON.parse(storageMap.get('linkedin-post-history')!) as HistoryItem[]
      expect(stored).toHaveLength(50)
      // Ältestes Item wurde entfernt
      expect(stored[0].id).toBe('test-uuid-1')
      expect(stored[49].id).toBe('item-48')
    })
  })

  describe('updateItem', () => {
    it('aktualisiert den Content eines Items', async () => {
      const items = [createStoredItem({ id: 'update-me' })]
      storageMap.set('linkedin-post-history', JSON.stringify(items))

      await localStorageAdapter.updateItem(undefined, 'update-me', {
        content: 'Neuer Inhalt',
        charCount: 12,
      })

      const stored = JSON.parse(storageMap.get('linkedin-post-history')!) as HistoryItem[]
      expect(stored[0].content).toBe('Neuer Inhalt')
      expect(stored[0].charCount).toBe(12)
    })

    it('aktualisiert Versions eines Items', async () => {
      const items = [createStoredItem({ id: 'update-me' })]
      storageMap.set('linkedin-post-history', JSON.stringify(items))

      const versions = [
        { id: 'v1', content: 'Version 1', timestamp: '2026-01-01T00:00:00Z', action: 'generate' as const },
      ]

      await localStorageAdapter.updateItem(undefined, 'update-me', { versions })

      const stored = JSON.parse(storageMap.get('linkedin-post-history')!) as HistoryItem[]
      expect(stored[0].versions).toEqual(versions)
    })

    it('ändert andere Items nicht', async () => {
      const items = [
        createStoredItem({ id: 'keep', content: 'Unverändert' }),
        createStoredItem({ id: 'update-me', content: 'Alt' }),
      ]
      storageMap.set('linkedin-post-history', JSON.stringify(items))

      await localStorageAdapter.updateItem(undefined, 'update-me', { content: 'Neu' })

      const stored = JSON.parse(storageMap.get('linkedin-post-history')!) as HistoryItem[]
      expect(stored[0].content).toBe('Unverändert')
      expect(stored[1].content).toBe('Neu')
    })
  })

  describe('removeItem', () => {
    it('entfernt ein Item anhand der ID', async () => {
      const items = [
        createStoredItem({ id: 'bleiben' }),
        createStoredItem({ id: 'entfernen' }),
      ]
      storageMap.set('linkedin-post-history', JSON.stringify(items))

      await localStorageAdapter.removeItem(undefined, 'entfernen')

      const stored = JSON.parse(storageMap.get('linkedin-post-history')!) as HistoryItem[]
      expect(stored).toHaveLength(1)
      expect(stored[0].id).toBe('bleiben')
    })
  })

  describe('clearAll', () => {
    it('entfernt alle Items aus dem Storage', async () => {
      storageMap.set('linkedin-post-history', JSON.stringify([createStoredItem()]))

      await localStorageAdapter.clearAll(undefined)

      expect(storageMap.has('linkedin-post-history')).toBe(false)
    })
  })

  describe('clearLocalStorage (Export)', () => {
    it('entfernt den Storage-Key', () => {
      storageMap.set('linkedin-post-history', 'data')

      clearLocalStorage()

      expect(storageMap.has('linkedin-post-history')).toBe(false)
    })
  })
})
