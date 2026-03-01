import { useState, useEffect, useCallback } from 'react'
import { Lightbulb, MessageCircle, Bug, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useFeedback } from '../../hooks/useFeedback'
import { FEEDBACK_TYPE_OPTIONS, FEEDBACK_CATEGORY_OPTIONS } from '../../constants/feedback'
import type { FeedbackType, FeedbackCategory } from '../../types/feedback'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

const TYPE_ICONS: Record<FeedbackType, typeof Lightbulb> = {
  feature_request: Lightbulb,
  feedback: MessageCircle,
  bug: Bug,
}

const DESCRIPTION_MAX = 2000

export default function FeedbackModal({ isOpen, onClose, onLoginClick }: FeedbackModalProps) {
  const { user } = useAuth()
  const { loading, error, success, submitFeedback, reset } = useFeedback()

  const [type, setType] = useState<FeedbackType>('feedback')
  const [category, setCategory] = useState<FeedbackCategory | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset()
      setType('feedback')
      setCategory(null)
      setTitle('')
      setDescription('')
    }
  }, [isOpen, reset])

  // Auto-close after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(onClose, 2000)
      return () => clearTimeout(timer)
    }
  }, [success, onClose])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await submitFeedback({ type, category, title, description })
  }, [type, category, title, description, submitFeedback])

  const handleLoginClick = useCallback(() => {
    onClose()
    onLoginClick()
  }, [onClose, onLoginClick])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel-elevated w-full max-w-lg mx-4 p-0 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold tracking-tight">Feedback & Wünsche</h2>
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

        {/* Content */}
        <div className="p-6">
          {/* Not logged in */}
          {!user ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Melde dich an, um Feedback zu senden oder Features vorzuschlagen.
                </p>
              </div>
              <button
                onClick={handleLoginClick}
                className="w-full flex items-center justify-center rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 h-11 px-4 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                Anmelden
              </button>
            </div>
          ) : success ? (
            /* Success state */
            <div className="text-center space-y-4 py-8">
              <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Vielen Dank!</p>
                <p className="text-sm text-muted-foreground">Dein Feedback wurde erfolgreich gesendet.</p>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type selector - pill buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium pl-1">Typ</label>
                <div className="flex gap-2">
                  {FEEDBACK_TYPE_OPTIONS.map(opt => {
                    const Icon = TYPE_ICONS[opt.value]
                    const isActive = type === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                            : 'glass-panel hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Category select */}
              <div className="space-y-2">
                <label htmlFor="fb-category" className="text-sm font-medium pl-1">Bereich (optional)</label>
                <select
                  id="fb-category"
                  value={category ?? ''}
                  onChange={e => setCategory(e.target.value ? e.target.value as FeedbackCategory : null)}
                  className="glass-input w-full rounded-xl px-4 py-2.5 transition-all"
                >
                  <option value="">— Kein Bereich —</option>
                  {FEEDBACK_CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="fb-title" className="text-sm font-medium pl-1">Titel</label>
                <input
                  id="fb-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Kurze Zusammenfassung..."
                  required
                  className="glass-input w-full rounded-xl px-4 py-2.5 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="fb-description" className="text-sm font-medium pl-1">Beschreibung</label>
                  <span className={`text-xs ${description.length > DESCRIPTION_MAX ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {description.length}/{DESCRIPTION_MAX}
                  </span>
                </div>
                <textarea
                  id="fb-description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Beschreibe dein Feedback oder deinen Wunsch..."
                  required
                  maxLength={DESCRIPTION_MAX}
                  rows={4}
                  className="glass-input w-full rounded-xl px-4 py-2.5 transition-all resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="glass-panel border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !title.trim() || !description.trim() || description.length > DESCRIPTION_MAX}
                className="w-full flex items-center justify-center rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 h-11 px-4 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  'Absenden'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
