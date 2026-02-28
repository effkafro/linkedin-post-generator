import { read, utils, type WorkBook } from 'xlsx'

// =============================================
// LinkedIn Analytics Export Parser
// Supports XLS/XLSX/CSV from LinkedIn Content Analytics
// Handles both EN and DE column headers
// =============================================

export interface ParsedPost {
  postUrl: string
  content: string | null
  postedAt: string | null
  impressions: number
  clicks: number
  ctr: number
  reactions: number
  comments: number
  shares: number
  videoViews: number
  mediaType: 'text' | 'image' | 'video' | 'carousel'
}

export interface ParseResult {
  posts: ParsedPost[]
  errors: string[]
  warnings: string[]
}

// Column name mapping: normalized key -> [EN variants, DE variants]
const COLUMN_MAP: Record<string, string[]> = {
  postUrl: ['Post URL', 'Post link', 'Beitrags-URL', 'Beitragslink', 'URL'],
  content: ['Post content', 'Content', 'Post text', 'Beitragsinhalt', 'Inhalt', 'Beitragstext'],
  postedAt: ['Date', 'Published date', 'Created date', 'Datum', 'Veröffentlichungsdatum', 'Erstellt am', 'Veröffentlicht am'],
  impressions: ['Impressions', 'Impressionen'],
  clicks: ['Clicks', 'Klicks'],
  ctr: ['Click through rate', 'CTR', 'Click-through rate', 'Klickrate'],
  reactions: ['Reactions', 'Reaktionen', 'Likes'],
  comments: ['Comments', 'Kommentare'],
  shares: ['Reposts', 'Shares', 'Reposts/Shares', 'Geteilte Inhalte', 'Geteilt'],
  videoViews: ['Video views', 'Video Views', 'Videoaufrufe', 'Videoansichten'],
}

type ColumnMapping = Record<string, string | null>

function buildColumnMapping(headers: string[]): { mapping: ColumnMapping; warnings: string[] } {
  const warnings: string[] = []
  const mapping: ColumnMapping = {}
  const normalizedHeaders = headers.map(h => h.trim())

  for (const [key, variants] of Object.entries(COLUMN_MAP)) {
    const found = normalizedHeaders.find(h =>
      variants.some(v => h.toLowerCase() === v.toLowerCase())
    )
    mapping[key] = found ?? null
  }

  if (!mapping.postUrl) {
    warnings.push('Spalte "Post URL" nicht gefunden - versuche Fallback-Erkennung')
    // Try to find any column containing "url" or "link"
    const urlCol = normalizedHeaders.find(h =>
      h.toLowerCase().includes('url') || h.toLowerCase().includes('link')
    )
    if (urlCol) mapping.postUrl = urlCol
  }

  const optionalFields = ['videoViews', 'content']
  for (const field of optionalFields) {
    if (!mapping[field]) {
      warnings.push(`Optionale Spalte "${field}" nicht gefunden - wird uebersprungen`)
    }
  }

  return { mapping, warnings }
}

function parseNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'number') return value
  const str = String(value).replace(/[,%]/g, '').replace(/\./g, '').replace(',', '.').trim()
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

function parsePercentage(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'number') return value > 1 ? value : value * 100
  const str = String(value).replace('%', '').replace(',', '.').trim()
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

function detectMediaType(row: Record<string, unknown>): 'text' | 'image' | 'video' | 'carousel' {
  // Try to detect from content type column or media column
  const mediaHints = ['Media type', 'Content type', 'Medientyp', 'Inhaltstyp', 'Type']
  for (const hint of mediaHints) {
    const val = row[hint]
    if (typeof val === 'string') {
      const lower = val.toLowerCase()
      if (lower.includes('video')) return 'video'
      if (lower.includes('carousel') || lower.includes('dokument') || lower.includes('document')) return 'carousel'
      if (lower.includes('image') || lower.includes('bild') || lower.includes('photo') || lower.includes('foto')) return 'image'
    }
  }
  return 'text'
}

function parseDate(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'number') {
    // Excel serial date number
    const date = new Date((value - 25569) * 86400 * 1000)
    if (!isNaN(date.getTime())) return date.toISOString()
  }
  const str = String(value).trim()
  if (!str) return null
  const date = new Date(str)
  if (!isNaN(date.getTime())) return date.toISOString()
  // Try DD.MM.YYYY format (German)
  const deMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (deMatch) {
    const d = new Date(`${deMatch[3]}-${deMatch[2].padStart(2, '0')}-${deMatch[1].padStart(2, '0')}`)
    if (!isNaN(d.getTime())) return d.toISOString()
  }
  return null
}

function getCell(row: Record<string, unknown>, colName: string | null): unknown {
  if (!colName) return null
  return row[colName] ?? null
}

export function parseLinkedInExport(data: ArrayBuffer): ParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const posts: ParsedPost[] = []

  let workbook: WorkBook
  try {
    workbook = read(data, { type: 'array' })
  } catch {
    return { posts: [], errors: ['Datei konnte nicht gelesen werden. Bitte XLS, XLSX oder CSV verwenden.'], warnings: [] }
  }

  if (workbook.SheetNames.length === 0) {
    return { posts: [], errors: ['Keine Tabellenblaetter in der Datei gefunden.'], warnings: [] }
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = utils.sheet_to_json<Record<string, unknown>>(sheet)

  if (rows.length === 0) {
    return { posts: [], errors: ['Die Datei enthaelt keine Daten.'], warnings: [] }
  }

  // Build column mapping from headers
  const headers = Object.keys(rows[0])
  const { mapping, warnings: mappingWarnings } = buildColumnMapping(headers)
  warnings.push(...mappingWarnings)

  if (!mapping.postUrl) {
    errors.push('Pflichtfeld "Post URL" konnte nicht zugeordnet werden. Bitte den LinkedIn Content Analytics Export verwenden.')
    return { posts, errors, warnings }
  }

  const requiredMetric = mapping.reactions || mapping.impressions
  if (!requiredMetric) {
    errors.push('Weder Reaktionen noch Impressionen gefunden. Ist dies ein LinkedIn Content Analytics Export?')
    return { posts, errors, warnings }
  }

  const seenUrls = new Set<string>()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rawUrl = getCell(row, mapping.postUrl)

    if (!rawUrl || String(rawUrl).trim() === '') {
      // Skip empty rows silently
      continue
    }

    const postUrl = String(rawUrl).trim()

    if (seenUrls.has(postUrl)) {
      warnings.push(`Zeile ${i + 2}: Doppelter Post uebersprungen (${postUrl.slice(0, 60)}...)`)
      continue
    }
    seenUrls.add(postUrl)

    const content = mapping.content ? String(getCell(row, mapping.content) ?? '') || null : null
    const postedAt = parseDate(getCell(row, mapping.postedAt))
    const impressions = parseNumber(getCell(row, mapping.impressions))
    const clicks = parseNumber(getCell(row, mapping.clicks))
    const ctrRaw = parsePercentage(getCell(row, mapping.ctr))
    const reactions = parseNumber(getCell(row, mapping.reactions))
    const comments = parseNumber(getCell(row, mapping.comments))
    const shares = parseNumber(getCell(row, mapping.shares))
    const videoViews = parseNumber(getCell(row, mapping.videoViews))

    // Calculate CTR if not provided but we have impressions and clicks
    const ctr = ctrRaw > 0 ? ctrRaw : (impressions > 0 ? (clicks / impressions) * 100 : 0)

    posts.push({
      postUrl,
      content,
      postedAt,
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      reactions,
      comments,
      shares,
      videoViews,
      mediaType: detectMediaType(row),
    })
  }

  if (posts.length === 0) {
    errors.push('Keine gueltigen Posts in der Datei gefunden.')
  }

  return { posts, errors, warnings }
}
