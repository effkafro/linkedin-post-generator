import { createElement, Fragment, type ReactNode } from 'react'

/**
 * @deprecated Nutze `formatTextSafe` für sicheres Rendering ohne XSS-Risiko.
 * Diese Funktion wird noch für Copy-to-Clipboard (plain HTML) gebraucht.
 */
export function formatTextInteractive(text: string): string {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

/** Segment-Typen für den Text-Parser */
interface TextSegment {
  type: 'bold' | 'italic' | 'text'
  content: string
}

/**
 * Sicheres Text-Formatting als ReactNode — kein dangerouslySetInnerHTML nötig.
 * Unterstützt **bold**, *italic* und Zeilenumbrüche.
 */
export function formatTextSafe(text: string): ReactNode {
  if (!text) return null

  const lines = text.split('\n')

  const parseInline = (line: string, lineIndex: number): ReactNode[] => {
    const segments: TextSegment[] = []
    // Regex: **bold** oder *italic* Abschnitte erkennen
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      // Text vor dem Match
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: line.slice(lastIndex, match.index) })
      }

      if (match[1] !== undefined) {
        segments.push({ type: 'bold', content: match[1] })
      } else if (match[2] !== undefined) {
        segments.push({ type: 'italic', content: match[2] })
      }

      lastIndex = match.index + match[0].length
    }

    // Restlicher Text nach dem letzten Match
    if (lastIndex < line.length) {
      segments.push({ type: 'text', content: line.slice(lastIndex) })
    }

    return segments.map((seg, i) => {
      const key = `${lineIndex}-${i}`
      switch (seg.type) {
        case 'bold':
          return createElement('strong', { key }, seg.content)
        case 'italic':
          return createElement('em', { key }, seg.content)
        default:
          return createElement(Fragment, { key }, seg.content)
      }
    })
  }

  const elements: ReactNode[] = []
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      elements.push(createElement('br', { key: `br-${lineIndex}` }))
    }
    elements.push(...parseInline(line, lineIndex))
  })

  return createElement(Fragment, null, ...elements)
}
