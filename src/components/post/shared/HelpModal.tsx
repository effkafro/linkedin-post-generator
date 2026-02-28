interface HelpModalProps {
  title: string
  items: { label: string; description: string }[]
  onClose: () => void
}

export default function HelpModal({ title, items, onClose }: HelpModalProps) {
  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel-elevated w-full max-w-lg mx-4 p-0 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {items.map(item => (
            <div key={item.label} className="p-4 rounded-2xl bg-secondary/30 border border-white/5 hover:bg-secondary/50 transition-colors">
              <div className="font-medium text-base mb-1 text-primary">{item.label}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
