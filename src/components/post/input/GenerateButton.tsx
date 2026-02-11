import type { InputMode } from '../../../types/post'

interface GenerateButtonProps {
  loading: boolean
  disabled: boolean
  mode: InputMode
  onClick: () => void
}

export default function GenerateButton({ loading, disabled, mode, onClick }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex w-full items-center justify-center rounded-2xl py-4 text-base font-semibold shadow-lg transition-all duration-300 ${loading || disabled
        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
        : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
        }`}
    >
      {loading ? (
        <>
          <span className="animate-spin mr-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
          {mode === 'url' ? 'Lade Artikel...' : 'Generiere Post...'}
        </>
      ) : (
        'Post Generieren'
      )}
    </button>
  )
}
