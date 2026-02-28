import { PenLine, BarChart3 } from 'lucide-react'

interface HomePageProps {
  onSelectCreator: () => void
  onSelectDashboard: () => void
}

export default function HomePage({ onSelectCreator, onSelectDashboard }: HomePageProps) {
  return (
    <div className="flex-1 pt-12 md:pt-20">
      <div className="flex flex-col items-center gap-10 w-full max-w-2xl mx-auto px-4">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Dein persönlicher <br className="hidden sm:block" />
            <span className="text-gradient">LinkedIn Assistent</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Erstelle perfekten Content und analysiere deine Performance mit KI-Unterstützung.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <button
            onClick={onSelectCreator}
            className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-5 text-center transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.15)] group-hover:shadow-[0_0_25px_rgba(14,165,233,0.3)]">
              <PenLine className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2 relative">
              <h2 className="text-xl font-bold">Content Creator</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                LinkedIn Posts erstellen, verfeinern und optimieren
              </p>
            </div>
          </button>

          <button
            onClick={onSelectDashboard}
            className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-5 text-center transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden"
          >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.15)] group-hover:shadow-[0_0_25px_rgba(14,165,233,0.3)]">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2 relative">
              <h2 className="text-xl font-bold">Dashboard</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Analytics und Performance deiner LinkedIn Posts
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
