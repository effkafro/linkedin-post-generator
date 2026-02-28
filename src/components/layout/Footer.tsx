interface FooterProps {
  onNavigate: (view: 'impressum' | 'privacy' | 'terms') => void
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 w-full border-t border-white/[0.06] py-4 px-6 bg-background/80 backdrop-blur-sm z-40">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <button
          onClick={() => onNavigate('impressum')}
          className="hover:text-foreground transition-colors"
        >
          Impressum
        </button>
        <span className="text-muted-foreground/40">|</span>
        <button
          onClick={() => onNavigate('privacy')}
          className="hover:text-foreground transition-colors"
        >
          Datenschutz
        </button>
        <span className="text-muted-foreground/40">|</span>
        <button
          onClick={() => onNavigate('terms')}
          className="hover:text-foreground transition-colors"
        >
          Nutzungsbedingungen
        </button>
      </div>
    </footer>
  )
}
