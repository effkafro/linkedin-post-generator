import type { HistoryItem } from '../../types/history'
import PostHistoryItem from './PostHistoryItem'

interface PostHistoryProps {
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onDelete: (id: string) => void
  onClearAll: () => void
  onNewPost: () => void
  hasActivePost: boolean
}

export default function PostHistory({ history, onSelect, onDelete, onClearAll, onNewPost, hasActivePost }: PostHistoryProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="font-semibold text-foreground tracking-tight">Verlauf</h2>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition-all"
          >
            Alle löschen
          </button>
        )}
      </div>

      {/* New Post Button */}
      <div className="px-4 pt-4">
        <button
          onClick={onNewPost}
          disabled={!hasActivePost}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neuer Post
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 opacity-60">
            <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">
              Noch keine Posts generiert
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[150px]">
              Deine generierten Posts erscheinen hier automatisch.
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
        <div className="px-5 py-3 border-t border-white/10 text-[10px] font-medium text-muted-foreground text-center bg-white/5">
          {history.length} {history.length === 1 ? 'Eintrag' : 'Einträge'} gespeichert
        </div>
      )}
    </div>
  )
}
