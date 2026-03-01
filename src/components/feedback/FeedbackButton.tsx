import { MessageSquarePlus } from 'lucide-react'

interface FeedbackButtonProps {
  onClick: () => void
  pulse?: boolean
}

export default function FeedbackButton({ onClick, pulse }: FeedbackButtonProps) {
  return (
    <button
      id="feedback-btn"
      onClick={onClick}
      className={`p-2 rounded-full hover:bg-accent transition-colors ${pulse ? 'animate-feedback-pulse' : ''}`}
      aria-label="Feedback geben"
    >
      <MessageSquarePlus className="w-5 h-5" />
    </button>
  )
}
