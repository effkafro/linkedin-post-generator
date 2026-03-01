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
    if (!visible) {
      onPulseChange(false)
      return
    }

    onPulseChange(true)
    return () => {
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
    <div className="fixed top-20 right-4 z-40 max-w-sm animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="relative p-[1px] rounded-[1.6rem] bg-gradient-to-b from-primary/30 to-transparent shadow-[0_0_30px_rgba(14,165,233,0.15)] group overflow-hidden">
        {/* Glow effect behind the banner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10 opacity-70" />

        <div className="glass-panel-elevated p-5 relative rounded-[calc(1.6rem-1px)]">
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all z-10 glass-panel border-transparent shadow-none"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-4">
            <div className="shrink-0 pt-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                <MessageSquarePlus className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="flex-1 pr-6 relative z-10">
              <h3 className="text-sm font-bold mb-1 text-foreground">Neu: Feedback & Wünsche</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Wir arbeiten ständig daran, Copost besser zu machen. Erzähl uns, welche Features dir noch fehlen!
              </p>

              <button
                onClick={handleClick}
                className="glass-button w-full py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2"
              >
                Jetzt Feedback geben
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
