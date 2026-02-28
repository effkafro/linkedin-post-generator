import { read, utils, type WorkBook } from 'xlsx'
import type { DailyEngagement, FollowerData, DiscoverySummary, ExportType } from '../types/analytics'

// =============================================
// LinkedIn Analytics Export Parser
// Supports XLS/XLSX/CSV from LinkedIn Content Analytics
// Handles both Company Page Export (flat table) and
// Personal Profile Export (5 sheets: DISCOVERY, ENGAGEMENT, TOP POSTS, FOLLOWERS, DEMOGRAPHICS)
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
  engagementTotal?: number // Override for personal exports (no breakdown available)
}

export interface ParseResult {
  posts: ParsedPost[]
  errors: string[]
  warnings: string[]
  exportType: ExportType
  dailyEngagement?: DailyEngagement[]
  followerData?: FollowerData[]
  totalFollowers?: number
  discoverySummary?: DiscoverySummary
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

/** Parse a date string to YYYY-MM-DD format */
function parseDateToISO(value: unknown): string | null {
  const iso = parseDate(value)
  if (!iso) return null
  return iso.split('T')[0]
}

function getCell(row: Record<string, unknown>, colName: string | null): unknown {
  if (!colName) return null
  return row[colName] ?? null
}

// =============================================
// Export Type Detection
// =============================================

function detectExportType(workbook: WorkBook): ExportType {
  const sheetNames = workbook.SheetNames.map(s => s.toUpperCase())
  // EN: "ENGAGEMENT", "TOP POSTS", "DISCOVERY", "FOLLOWERS", "DEMOGRAPHICS"
  // DE: "INTERAKTION", "TOP-BEITRÄGE", "ENTDECKUNG", "FOLLOWER", "DEMOGRAFIEN"
  const hasEngagement = sheetNames.some(s =>
    s === 'ENGAGEMENT' || s === 'INTERAKTION' || s === 'INTERAKTIONEN'
  )
  const hasTopPosts = sheetNames.some(s =>
    s === 'TOP POSTS' || s.includes('TOP-BEITR') || s.includes('TOP BEITR')
  )
  return (hasEngagement && hasTopPosts) ? 'personal' : 'company'
}

// =============================================
// Company Page Export Parser (flat table)
// =============================================

function parseCompanyExport(workbook: WorkBook): ParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const posts: ParsedPost[] = []

  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = utils.sheet_to_json<Record<string, unknown>>(sheet)

  if (rows.length === 0) {
    return { posts: [], errors: ['Die Datei enthaelt keine Daten.'], warnings: [], exportType: 'company' }
  }

  const headers = Object.keys(rows[0])
  const { mapping, warnings: mappingWarnings } = buildColumnMapping(headers)
  warnings.push(...mappingWarnings)

  if (!mapping.postUrl) {
    errors.push('Pflichtfeld "Post URL" konnte nicht zugeordnet werden. Bitte den LinkedIn Content Analytics Export verwenden.')
    return { posts, errors, warnings, exportType: 'company' }
  }

  const requiredMetric = mapping.reactions || mapping.impressions
  if (!requiredMetric) {
    errors.push('Weder Reaktionen noch Impressionen gefunden. Ist dies ein LinkedIn Content Analytics Export?')
    return { posts, errors, warnings, exportType: 'company' }
  }

  const seenUrls = new Set<string>()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rawUrl = getCell(row, mapping.postUrl)

    if (!rawUrl || String(rawUrl).trim() === '') continue

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

  return { posts, errors, warnings, exportType: 'company' }
}

// =============================================
// Personal Profile Export Parser (multi-sheet)
// =============================================

function parsePersonalExport(workbook: WorkBook): ParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const posts: ParsedPost[] = []

  // Find sheets case-insensitively, with German variants
  const SHEET_ALIASES: Record<string, string[]> = {
    'TOP POSTS': ['TOP POSTS', 'TOP-BEITRÄGE', 'TOP BEITRÄGE', 'TOP-BEITRAEGE'],
    'ENGAGEMENT': ['ENGAGEMENT', 'INTERAKTION', 'INTERAKTIONEN'],
    'DISCOVERY': ['DISCOVERY', 'ENTDECKUNG'],
    'FOLLOWERS': ['FOLLOWERS', 'FOLLOWER'],
  }

  const findSheet = (name: string) => {
    const aliases = SHEET_ALIASES[name] ?? [name]
    const found = workbook.SheetNames.find(s =>
      aliases.some(a => s.toUpperCase() === a.toUpperCase() || s.toUpperCase().includes(a.toUpperCase()))
    )
    return found ? workbook.Sheets[found] : null
  }

  // --- TOP POSTS ---
  const topPostsSheet = findSheet('TOP POSTS')
  if (topPostsSheet) {
    // Use header:1 to get raw arrays — avoids __EMPTY column naming issues
    const rawRows = utils.sheet_to_json<unknown[]>(topPostsSheet, { header: 1 })

    // LinkedIn personal export TOP POSTS has a dual-ranking layout:
    // Left side: ranked by engagements, Right side: ranked by impressions
    // Row 0: Note/disclaimer
    // Row 1: Headers (e.g., "Post URL", "Date", "Engagements", "", "Post URL", "Date", "Impressions")
    // Row 2+: Data

    // Find the header row dynamically (the row containing "Post URL" or similar)
    let headerRowIdx = -1
    for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
      const row = rawRows[r] as unknown[]
      if (row?.some(c => String(c ?? '').toLowerCase().includes('post url'))) {
        headerRowIdx = r
        break
      }
    }

    if (headerRowIdx >= 0 && headerRowIdx + 1 < rawRows.length) {
      const headerRow = rawRows[headerRowIdx] as string[]

      // Find column indices for left and right tables
      let leftUrlIdx = -1
      let leftDateIdx = -1
      let leftEngIdx = -1
      let rightUrlIdx = -1
      let rightDateIdx = -1
      let rightImpIdx = -1

      for (let i = 0; i < headerRow.length; i++) {
        const h = String(headerRow[i] ?? '').trim().toLowerCase()
        if (h.includes('url') || h.includes('link')) {
          if (leftUrlIdx === -1) leftUrlIdx = i
          else rightUrlIdx = i
        } else if (h.includes('date') || h.includes('datum')) {
          if (leftDateIdx === -1) leftDateIdx = i
          else rightDateIdx = i
        } else if (h === 'engagements' || h === 'interaktionen') {
          leftEngIdx = i
        } else if (h === 'impressions' || h === 'impressionen') {
          rightImpIdx = i
        }
      }

      // Merge by URL: collect all data into a map
      const postMap = new Map<string, { date: string | null; engagements: number; impressions: number }>()

      for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
        const row = rawRows[r] as unknown[]
        if (!row || row.length === 0) continue

        // Left table (engagements)
        if (leftUrlIdx >= 0) {
          const url = String(row[leftUrlIdx] ?? '').trim()
          if (url && url.startsWith('http')) {
            const existing = postMap.get(url) ?? { date: null, engagements: 0, impressions: 0 }
            if (leftDateIdx >= 0) existing.date = parseDateToISO(row[leftDateIdx]) ?? existing.date
            if (leftEngIdx >= 0) existing.engagements = parseNumber(row[leftEngIdx])
            postMap.set(url, existing)
          }
        }

        // Right table (impressions)
        if (rightUrlIdx >= 0) {
          const url = String(row[rightUrlIdx] ?? '').trim()
          if (url && url.startsWith('http')) {
            const existing = postMap.get(url) ?? { date: null, engagements: 0, impressions: 0 }
            if (rightDateIdx >= 0) existing.date = parseDateToISO(row[rightDateIdx]) ?? existing.date
            if (rightImpIdx >= 0) existing.impressions = parseNumber(row[rightImpIdx])
            postMap.set(url, existing)
          }
        }
      }

      for (const [url, data] of postMap) {
        posts.push({
          postUrl: url,
          content: null,
          postedAt: data.date ? new Date(data.date).toISOString() : null,
          impressions: data.impressions,
          clicks: 0,
          ctr: 0,
          reactions: 0,
          comments: 0,
          shares: 0,
          videoViews: 0,
          mediaType: 'text',
          engagementTotal: data.engagements,
        })
      }
    } else {
      warnings.push('TOP POSTS Sheet: Header-Zeile mit "Post URL" nicht gefunden')
    }
  } else {
    warnings.push('TOP POSTS Sheet nicht gefunden')
  }

  // --- ENGAGEMENT ---
  let dailyEngagement: DailyEngagement[] | undefined
  const engagementSheet = findSheet('ENGAGEMENT')
  if (engagementSheet) {
    const rawRows = utils.sheet_to_json<unknown[]>(engagementSheet, { header: 1 })
    // Find header row dynamically (contains "Date" or "Datum")
    let engHeaderIdx = -1
    for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
      const row = rawRows[r] as unknown[]
      if (row?.some(c => {
        const s = String(c ?? '').trim().toLowerCase()
        return s.includes('date') || s.includes('datum')
      })) {
        engHeaderIdx = r
        break
      }
    }

    if (engHeaderIdx >= 0 && engHeaderIdx + 1 < rawRows.length) {
      const headerRow = rawRows[engHeaderIdx] as string[]
      let dateIdx = -1
      let impIdx = -1
      let engIdx = -1

      for (let i = 0; i < headerRow.length; i++) {
        const h = String(headerRow[i] ?? '').trim().toLowerCase()
        if (h.includes('date') || h.includes('datum')) dateIdx = i
        else if (h === 'impressions' || h === 'impressionen') impIdx = i
        else if (h === 'engagements' || h === 'interaktionen') engIdx = i
      }

      if (dateIdx >= 0) {
        dailyEngagement = []
        for (let r = engHeaderIdx + 1; r < rawRows.length; r++) {
          const row = rawRows[r] as unknown[]
          if (!row || row.length === 0) continue
          const date = parseDateToISO(row[dateIdx])
          if (!date) continue
          dailyEngagement.push({
            date,
            impressions: impIdx >= 0 ? parseNumber(row[impIdx]) : 0,
            engagements: engIdx >= 0 ? parseNumber(row[engIdx]) : 0,
          })
        }
        dailyEngagement.sort((a, b) => a.date.localeCompare(b.date))
      }
    }
  }

  // --- DISCOVERY ---
  let discoverySummary: DiscoverySummary | undefined
  const discoverySheet = findSheet('DISCOVERY')
  if (discoverySheet) {
    const rawRows = utils.sheet_to_json<unknown[]>(discoverySheet, { header: 1 })
    // Typically: Row 0 has summary values or labels
    // Look for "Impressions" and "Members reached" / "Mitglieder erreicht"
    let impressions = 0
    let membersReached = 0
    for (const row of rawRows) {
      const arr = row as unknown[]
      for (let i = 0; i < arr.length; i++) {
        const cell = String(arr[i] ?? '').trim().toLowerCase()
        if (cell === 'impressions' || cell === 'impressionen') {
          impressions = parseNumber(arr[i + 1] ?? arr[i - 1])
        }
        if (cell.includes('members reached') || cell.includes('mitglieder erreicht') || cell.includes('member')) {
          membersReached = parseNumber(arr[i + 1] ?? arr[i - 1])
        }
      }
    }
    if (impressions > 0 || membersReached > 0) {
      discoverySummary = { impressions, membersReached }
    }
  }

  // --- FOLLOWERS ---
  let followerData: FollowerData[] | undefined
  let totalFollowers: number | undefined
  const followersSheet = findSheet('FOLLOWERS')
  if (followersSheet) {
    const rawRows = utils.sheet_to_json<unknown[]>(followersSheet, { header: 1 })
    // Row 0: Total followers value, Row 1: Headers (Date, New followers), Row 2+: Data
    if (rawRows.length >= 2) {
      // Try to extract total followers from row 0
      const row0 = rawRows[0] as unknown[]
      for (const cell of row0) {
        const num = parseNumber(cell)
        if (num > 0) {
          totalFollowers = num
          break
        }
      }

      // Find header row dynamically
      let headerRowIdx = 1
      for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
        const row = rawRows[r] as unknown[]
        const hasDate = row?.some(c => {
          const s = String(c ?? '').trim().toLowerCase()
          return s.includes('date') || s.includes('datum')
        })
        if (hasDate) {
          headerRowIdx = r
          break
        }
      }

      const headerRow = rawRows[headerRowIdx] as string[]
      let dateIdx = -1
      let newFollowersIdx = -1

      for (let i = 0; i < headerRow.length; i++) {
        const h = String(headerRow[i] ?? '').trim().toLowerCase()
        if (h.includes('date') || h.includes('datum')) dateIdx = i
        else if (h.includes('new followers') || h.includes('neue follower') || h.includes('follower')) newFollowersIdx = i
      }

      if (dateIdx >= 0 && newFollowersIdx >= 0) {
        followerData = []
        for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
          const row = rawRows[r] as unknown[]
          if (!row || row.length === 0) continue
          const date = parseDateToISO(row[dateIdx])
          if (!date) continue
          followerData.push({
            date,
            newFollowers: parseNumber(row[newFollowersIdx]),
          })
        }
        followerData.sort((a, b) => a.date.localeCompare(b.date))
      }
    }
  }

  if (posts.length === 0) {
    errors.push('Keine Posts im TOP POSTS Sheet gefunden.')
  }

  return {
    posts,
    errors,
    warnings,
    exportType: 'personal',
    dailyEngagement,
    followerData,
    totalFollowers,
    discoverySummary,
  }
}

// =============================================
// Main Entry Point
// =============================================

export function parseLinkedInExport(data: ArrayBuffer): ParseResult {
  let workbook: WorkBook
  try {
    workbook = read(data, { type: 'array' })
  } catch {
    return {
      posts: [], errors: ['Datei konnte nicht gelesen werden. Bitte XLS, XLSX oder CSV verwenden.'],
      warnings: [], exportType: 'company',
    }
  }

  if (workbook.SheetNames.length === 0) {
    return { posts: [], errors: ['Keine Tabellenblaetter in der Datei gefunden.'], warnings: [], exportType: 'company' }
  }

  const exportType = detectExportType(workbook)

  if (exportType === 'personal') {
    return parsePersonalExport(workbook)
  }

  return parseCompanyExport(workbook)
}
