import { describe, it, expect } from 'vitest'
import { hashContent } from '../hashContent'

describe('hashContent', () => {
  it('gibt einen Hex-String zurück', () => {
    const result = hashContent('test')
    expect(result).toMatch(/^[0-9a-f]+$/)
  })

  it('gibt konsistente Ergebnisse für gleichen Input', () => {
    const hash1 = hashContent('Hallo Welt')
    const hash2 = hashContent('Hallo Welt')
    expect(hash1).toBe(hash2)
  })

  it('gibt verschiedene Hashes für verschiedenen Input', () => {
    const hash1 = hashContent('Text A')
    const hash2 = hashContent('Text B')
    expect(hash1).not.toBe(hash2)
  })

  it('verarbeitet leeren String', () => {
    const result = hashContent('')
    expect(result).toBe('0')
  })

  it('verarbeitet Sonderzeichen und Umlaute', () => {
    const result = hashContent('Ä Ö Ü ß')
    expect(result).toMatch(/^[0-9a-f]+$/)
  })

  it('verarbeitet langen Text', () => {
    const longText = 'a'.repeat(10000)
    const result = hashContent(longText)
    expect(result).toMatch(/^[0-9a-f]+$/)
  })
})
