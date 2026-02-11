import { useState } from 'react'

interface ActionBarProps {
  output: string
  disabled: boolean
  onReset: () => void
}

export default function ActionBar({ output, disabled, onReset }: ActionBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-4 pt-2">
      <button
        onClick={handleCopy}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 h-12 px-6 ${copied
          ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/30'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
          }`}
      >
        {copied ? (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kopiert!
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Kopieren
          </>
        )}
      </button>
      <button
        onClick={onReset}
        disabled={disabled}
        className="flex-1 flex items-center justify-center rounded-xl text-sm font-medium glass-button h-12 px-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-all duration-300"
      >
        Neu starten
      </button>
    </div>
  )
}
