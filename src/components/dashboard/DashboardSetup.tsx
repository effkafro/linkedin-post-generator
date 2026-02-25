import { useState } from 'react'
import { Link2, BarChart3 } from 'lucide-react'

interface DashboardSetupProps {
  onConnect: (url: string) => Promise<void>
  loading: boolean
}

export default function DashboardSetup({ onConnect, loading }: DashboardSetupProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmed = url.trim()
    if (!trimmed) {
      setError('Bitte eine URL eingeben')
      return
    }

    if (!trimmed.includes('linkedin.com')) {
      setError('Bitte eine gueltige LinkedIn-URL eingeben')
      return
    }

    await onConnect(trimmed)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-panel p-8 md:p-12 max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Analytics einrichten</h2>
          <p className="text-muted-foreground text-sm">
            Verbinde deine LinkedIn Company Page, um deine Post-Performance zu analysieren.
            Wir crawlen deine oeffentlichen Posts und berechnen Engagement-Metriken.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.linkedin.com/company/deine-firma"
              className="glass-input w-full pl-10 pr-4 py-3 text-sm"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="glass-button w-full h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verbinden & Scrapen...
              </>
            ) : (
              'Verbinden'
            )}
          </button>
        </form>

        <p className="text-xs text-muted-foreground">
          Wir crawlen nur oeffentlich sichtbare Posts. Keine Login-Daten erforderlich.
        </p>
      </div>
    </div>
  )
}
