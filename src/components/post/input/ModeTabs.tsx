import type { InputMode } from '../../../types/post'
import { MODE_TABS } from '../../../constants/modes'

interface ModeTabsProps {
  mode: InputMode
  onChange: (mode: InputMode) => void
}

export default function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl w-fit backdrop-blur-md">
      {MODE_TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${mode === tab.value
            ? 'bg-white/90 text-foreground shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-white/20 dark:ring-white/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-white/20'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
