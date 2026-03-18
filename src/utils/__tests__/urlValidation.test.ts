import { describe, it, expect } from 'vitest'
import { isValidUrl } from '../urlValidation'

describe('isValidUrl', () => {
  it('akzeptiert gültige HTTP-URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('akzeptiert gültige HTTPS-URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  it('akzeptiert URLs mit Pfad', () => {
    expect(isValidUrl('https://example.com/pfad/seite')).toBe(true)
  })

  it('akzeptiert URLs mit Query-Parametern', () => {
    expect(isValidUrl('https://example.com?key=value&foo=bar')).toBe(true)
  })

  it('akzeptiert URLs mit Fragment', () => {
    expect(isValidUrl('https://example.com#abschnitt')).toBe(true)
  })

  it('lehnt leeren String ab', () => {
    expect(isValidUrl('')).toBe(false)
  })

  it('lehnt einfachen Text ab', () => {
    expect(isValidUrl('kein-url')).toBe(false)
  })

  it('lehnt Text ohne Protokoll ab', () => {
    expect(isValidUrl('example.com')).toBe(false)
  })

  it('lehnt unvollständige URLs ab', () => {
    expect(isValidUrl('https://')).toBe(false)
  })

  it('akzeptiert LinkedIn-URLs', () => {
    expect(isValidUrl('https://www.linkedin.com/posts/user-123')).toBe(true)
  })
})
