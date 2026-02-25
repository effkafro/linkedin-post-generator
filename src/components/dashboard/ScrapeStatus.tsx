import { RefreshCw } from 'lucide-react'
import type { ScrapeRun } from '../../types/analytics'

interface ScrapeStatusProps {
  lastRun: ScrapeRun | null
  scraping: boolean
  onScrape: () => void
}

const STATUS_COLORS: Record<string, string> = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  running: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  pending: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  success: 'Erfolgreich',
  error: 'Fehler',
  running: 'Laeuft...',
  pending: 'Ausstehend',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Nie'
  return new Date(dateStr).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ScrapeStatus({ lastRun, scraping, onScrape }: ScrapeStatusProps) {
  return (
    <div className="glass-panel p-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          Letzter Scrape:{' '}
          <span className="text-foreground font-medium">
            {lastRun ? formatDate(lastRun.completed_at ?? lastRun.started_at) : 'Noch nie'}
          </span>
        </div>
        {lastRun && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[lastRun.status] ?? ''}`}>
            {STATUS_LABELS[lastRun.status] ?? lastRun.status}
          </span>
        )}
        {lastRun?.status === 'success' && (
          <span className="text-xs text-muted-foreground">
            {lastRun.posts_found} gefunden, {lastRun.posts_new} neu
          </span>
        )}
      </div>
      <button
        onClick={onScrape}
        disabled={scraping}
        className="glass-button h-9 px-4 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
        {scraping ? 'Scraping...' : 'Daten aktualisieren'}
      </button>
    </div>
  )
}
