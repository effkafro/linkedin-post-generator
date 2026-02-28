interface VersionNavProps {
  currentIndex: number
  totalVersions: number
  disabled: boolean
  onPrev: () => void
  onNext: () => void
}

export default function VersionNav({ currentIndex, totalVersions, disabled, onPrev, onNext }: VersionNavProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Ergebnis</h2>
      <div className="flex items-center gap-3 bg-secondary/30 p-1.5 rounded-full backdrop-blur-md border border-white/5">
        <button
          onClick={onPrev}
          disabled={currentIndex <= 0 || disabled}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Vorherige Version"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-muted-foreground w-20 text-center select-none font-mono">
          V{currentIndex + 1} / {totalVersions}
        </span>
        <button
          onClick={onNext}
          disabled={currentIndex >= totalVersions - 1 || disabled}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Nächste Version"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
