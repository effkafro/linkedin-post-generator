import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ANONYMOUS_ACTION_LIMIT } from '../../constants/usageLimit'

interface UsageLimitModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'signin' | 'signup'

export default function UsageLimitModal({ isOpen, onClose }: UsageLimitModalProps) {
  const [mode, setMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { user, signIn, signUp, isConfigured } = useAuth()

  // Auto-close when user logs in
  useEffect(() => {
    if (user && isOpen) {
      onClose()
    }
  }, [user, isOpen, onClose])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onClose()
        }
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) {
          setError(error.message)
        } else {
          setSuccessMessage('Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [mode, email, password, fullName, signIn, signUp, onClose])

  const resetForm = useCallback(() => {
    setEmail('')
    setPassword('')
    setFullName('')
    setError(null)
    setSuccessMessage(null)
  }, [])

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }, [resetForm])

  if (!isOpen) return null

  if (!isConfigured) return null

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel-elevated w-full max-w-md mx-4 p-0 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with limit info */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
              aria-label="Schließen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            Kostenloses Limit erreicht
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Du hast {ANONYMOUS_ACTION_LIMIT} von {ANONYMOUS_ACTION_LIMIT} kostenlosen Aktionen genutzt.
            Melde dich kostenlos an, um weiterzumachen.
          </p>
        </div>

        {/* Auth Form */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="limit-fullName" className="text-sm font-medium pl-1">
                  Name
                </label>
                <input
                  id="limit-fullName"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="glass-input w-full rounded-xl px-4 py-2.5 transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="limit-email" className="text-sm font-medium pl-1">
                E-Mail
              </label>
              <input
                id="limit-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="max@example.com"
                required
                className="glass-input w-full rounded-xl px-4 py-2.5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="limit-password" className="text-sm font-medium pl-1">
                Passwort
              </label>
              <input
                id="limit-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                required
                minLength={6}
                className="glass-input w-full rounded-xl px-4 py-2.5 transition-all"
              />
            </div>

            {error && (
              <div className="glass-panel border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="glass-panel border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 h-11 px-4 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : mode === 'signin' ? (
                'Anmelden'
              ) : (
                'Kostenlos registrieren'
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="text-center text-sm pt-2">
            {mode === 'signin' ? (
              <p className="text-muted-foreground">
                Noch kein Konto?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors"
                >
                  Registrieren
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Bereits registriert?{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors"
                >
                  Anmelden
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
