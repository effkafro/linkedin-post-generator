import type { HistoryItem } from '../../types/history'

interface PostHistoryItemProps {
  item: HistoryItem
  onSelect: (item: HistoryItem) => void
  onDelete: (id: string) => void
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Gerade eben'
  if (diffMins < 60) return `vor ${diffMins} Min.`
  if (diffHours < 24) return `vor ${diffHours} Std.`
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export default function PostHistoryItem({ item, onSelect, onDelete }: PostHistoryItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(item.id)
  }

  // Display title: for URL mode show source title or URL, for topic mode show topic
  const displayTitle = item.mode === 'url'
    ? (item.source?.title || item.url || 'URL')
    : item.topic

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative p-4 rounded-2xl glass-input cursor-pointer hover:bg-white/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {item.mode === 'url' && (
              <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold bg-primary/20 text-primary rounded-md backdrop-blur-md border border-primary/10">
                URL
              </span>
            )}
            <h4 className="text-sm font-semibold text-foreground truncate leading-tight">
              {truncateText(displayTitle || 'Ohne Titel', 40)}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
            {truncateText(item.content, 80)}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all absolute bottom-3 right-3"
          aria-label="Eintrag löschen"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10px] font-medium text-muted-foreground/70">
        <span>{formatRelativeTime(item.createdAt)}</span>
        <span className="w-1 h-1 rounded-full bg-border"></span>
        <span>{item.charCount} Zeichen</span>
        {item.versions && item.versions.length > 1 && (
          <>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-semibold">
              {item.versions.length} Versionen
            </span>
          </>
        )}
      </div>
    </div>
  )
}
