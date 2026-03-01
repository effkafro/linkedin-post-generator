import { useState, useEffect, useCallback } from 'react'
import { MessageSquarePlus, X } from 'lucide-react'

const STORAGE_KEY = 'feedback-banner-dismissed'

interface NewFeatureBannerProps {
  onFeedbackClick: () => void
  onPulseChange: (pulse: boolean) => void
}

export default function NewFeatureBanner({ onFeedbackClick, onPulseChange }: NewFeatureBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  // Trigger pulse on the feedback button while banner is visible
  useEffect(() => {
    if (!visible) return
    onPulseChange(true)
    const timer = setTimeout(() => onPulseChange(false), 2400)
    return () => {
      clearTimeout(timer)
      onPulseChange(false)
    }
  }, [visible, onPulseChange])

  const dismiss = useCallback(() => {
    setVisible(false)
    sessionStorage.setItem(STORAGE_KEY, '1')
  }, [])

  const handleClick = useCallback(() => {
    dismiss()
    onFeedbackClick()
  }, [dismiss, onFeedbackClick])

  if (!visible) return null

  return (
    <div className="fixed top-16 right-4 z-40 max-w-xs animate-in slide-in-from-top-2 fade-in duration-500">
      <div className="glass-panel-elevated p-4 shadow-2xl">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-primary">
            <MessageSquarePlus className="w-4 h-4" />
            <span className="text-sm font-semibold">Neu: Feedback & Wünsche</span>
          </div>
          <button
            onClick={dismiss}
            className="p-1 rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
            aria-label="Schließen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Du hast Ideen oder Verbesserungsvorschläge? Wir freuen uns über dein Feedback.
        </p>

        <button
          onClick={handleClick}
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Jetzt Feedback geben &rarr;
        </button>
      </div>
    </div>
  )
}
