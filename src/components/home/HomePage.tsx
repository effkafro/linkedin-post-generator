import { PenLine, BarChart3 } from 'lucide-react'

interface HomePageProps {
  onSelectCreator: () => void
  onSelectDashboard: () => void
}

export default function HomePage({ onSelectCreator, onSelectDashboard }: HomePageProps) {
  return (
    <div className="flex-1 pt-20">
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <button
            onClick={onSelectCreator}
            className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-4 text-center hover:bg-white/10 dark:hover:bg-white/10 hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
          >
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <PenLine className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Content Creator</h2>
              <p className="text-sm text-muted-foreground">
                LinkedIn Posts erstellen, verfeinern und optimieren
              </p>
            </div>
          </button>

          <button
            onClick={onSelectDashboard}
            className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-4 text-center hover:bg-white/10 dark:hover:bg-white/10 hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
          >
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Analytics und Performance deiner LinkedIn Posts
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
