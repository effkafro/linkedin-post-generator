import { MessageSquarePlus } from 'lucide-react'

interface FeedbackButtonProps {
  onClick: () => void
  pulse?: boolean
}

export default function FeedbackButton({ onClick, pulse }: FeedbackButtonProps) {
  return (
    <div className="relative">
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping"></span>
      )}
      <button
        id="feedback-btn"
        onClick={onClick}
        className={`relative z-10 p-2 rounded-full transition-all duration-300 ${
          pulse 
            ? 'text-primary ring-2 ring-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(14,165,233,0.3)]' 
            : 'text-foreground hover:bg-white/10 glass-panel border-transparent'
        }`}
        aria-label="Feedback geben"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>
    </div>
  )
}
