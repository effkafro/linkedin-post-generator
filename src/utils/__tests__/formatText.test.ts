import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { formatTextInteractive, formatTextSafe } from '../formatText'

describe('formatTextInteractive', () => {
  it('gibt leeren String für leeren Input zurück', () => {
    expect(formatTextInteractive('')).toBe('')
  })

  it('gibt leeren String für falsy Input zurück', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(formatTextInteractive(undefined as any)).toBe('')
  })

  it('konvertiert **bold** zu <strong> Tags', () => {
    expect(formatTextInteractive('Das ist **fett** geschrieben')).toBe(
      'Das ist <strong>fett</strong> geschrieben'
    )
  })

  it('konvertiert *italic* zu <em> Tags', () => {
    expect(formatTextInteractive('Das ist *kursiv* geschrieben')).toBe(
      'Das ist <em>kursiv</em> geschrieben'
    )
  })

  it('konvertiert Zeilenumbrüche zu <br/> Tags', () => {
    expect(formatTextInteractive('Zeile 1\nZeile 2')).toBe(
      'Zeile 1<br/>Zeile 2'
    )
  })

  it('verarbeitet mehrere Zeilenumbrüche', () => {
    expect(formatTextInteractive('A\n\nB')).toBe('A<br/><br/>B')
  })

  it('kombiniert bold, italic und Zeilenumbrüche', () => {
    const input = '**Titel**\n*Untertitel*\nText'
    const expected = '<strong>Titel</strong><br/><em>Untertitel</em><br/>Text'
    expect(formatTextInteractive(input)).toBe(expected)
  })

  it('verarbeitet mehrere bold-Segmente', () => {
    expect(formatTextInteractive('**A** und **B**')).toBe(
      '<strong>A</strong> und <strong>B</strong>'
    )
  })

  it('gibt Text ohne Formatierung unverändert zurück', () => {
    expect(formatTextInteractive('Normaler Text')).toBe('Normaler Text')
  })
})

// Hilfsfunktion: ReactNode zu HTML-String rendern
function renderSafe(text: string): string {
  const node = formatTextSafe(text)
  if (node === null) return ''
  return renderToStaticMarkup(createElement('div', null, node))
}

describe('formatTextSafe', () => {
  it('gibt null für leeren String zurück', () => {
    expect(formatTextSafe('')).toBeNull()
  })

  it('rendert plain Text ohne Markup', () => {
    const html = renderSafe('Normaler Text')
    expect(html).toBe('<div>Normaler Text</div>')
  })

  it('rendert **bold** als <strong>', () => {
    const html = renderSafe('Das ist **fett** geschrieben')
    expect(html).toBe('<div>Das ist <strong>fett</strong> geschrieben</div>')
  })

  it('rendert *italic* als <em>', () => {
    const html = renderSafe('Das ist *kursiv* geschrieben')
    expect(html).toBe('<div>Das ist <em>kursiv</em> geschrieben</div>')
  })

  it('rendert Zeilenumbrüche als <br/>', () => {
    const html = renderSafe('Zeile 1\nZeile 2')
    expect(html).toBe('<div>Zeile 1<br/>Zeile 2</div>')
  })

  it('kombiniert bold, italic und Zeilenumbrüche', () => {
    const html = renderSafe('**Titel**\n*Untertitel*\nText')
    expect(html).toBe('<div><strong>Titel</strong><br/><em>Untertitel</em><br/>Text</div>')
  })

  it('verarbeitet mehrere bold-Segmente', () => {
    const html = renderSafe('**A** und **B**')
    expect(html).toBe('<div><strong>A</strong> und <strong>B</strong></div>')
  })

  it('escaped HTML-Tags — kein XSS möglich', () => {
    const html = renderSafe('**<script>alert(1)</script>**')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('escaped HTML in normalem Text', () => {
    const html = renderSafe('<img src=x onerror=alert(1)>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
  })

  it('behandelt leere Bold-Marker korrekt', () => {
    const html = renderSafe('Text **** weiter')
    // Sollte keinen Fehler werfen
    expect(html).toContain('Text')
    expect(html).toContain('weiter')
  })
})
