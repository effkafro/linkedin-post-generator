import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'signin' | 'signup'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { signIn, signUp, isConfigured } = useAuth()

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

  if (!isConfigured) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="bg-card text-card-foreground border border-border rounded-xl shadow-lg max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Auth nicht konfiguriert</h2>
            <p className="text-muted-foreground mb-4">
              Supabase ist nicht konfiguriert. Bitte setze VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in deiner .env.local Datei.
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card text-card-foreground border border-border rounded-xl shadow-lg max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">
            {mode === 'signin' ? 'Anmelden' : 'Registrieren'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* OAuth Buttons */}


          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="max@example.com"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                required
                minLength={6}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {error && (
              <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/15 border border-green-500/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : mode === 'signin' ? (
                'Anmelden'
              ) : (
                'Registrieren'
              )}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="text-center text-sm">
            {mode === 'signin' ? (
              <p className="text-muted-foreground">
                Noch kein Konto?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Registrieren
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Bereits registriert?{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-primary hover:underline font-medium"
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
