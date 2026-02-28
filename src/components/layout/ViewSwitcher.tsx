import { PenLine, BarChart3 } from 'lucide-react'

interface ViewSwitcherProps {
    currentView: string
    onChange: (view: 'workspace' | 'dashboard') => void
}

export default function ViewSwitcher({ currentView, onChange }: ViewSwitcherProps) {
    return (
        <div className="flex items-center p-1 rounded-full glass-panel-elevated shadow-lg">
            <button
                onClick={() => onChange('workspace')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${currentView === 'workspace'
                    ? 'bg-primary/20 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
            >
                <PenLine className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Creator</span>
            </button>
            <button
                onClick={() => onChange('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${currentView === 'dashboard'
                    ? 'bg-primary/20 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
            >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
            </button>
        </div>
    )
}
