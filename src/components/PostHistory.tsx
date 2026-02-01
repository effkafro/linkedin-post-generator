import type { HistoryItem } from '../types/history'
import PostHistoryItem from './PostHistoryItem'

interface PostHistoryProps {
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

export default function PostHistory({ history, onSelect, onDelete, onClearAll }: PostHistoryProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-foreground">Verlauf</h2>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Alle löschen
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              Noch keine Posts generiert
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Generierte Posts erscheinen hier
            </p>
          </div>
        ) : (
          history.map(item => (
            <PostHistoryItem
              key={item.id}
              item={item}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground text-center">
          {history.length} {history.length === 1 ? 'Eintrag' : 'Einträge'}
        </div>
      )}
    </div>
  )
}
