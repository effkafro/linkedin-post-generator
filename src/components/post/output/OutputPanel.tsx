import type { Tone, Style, Language, RefineAction } from '../../../types/post'
import type { SourceInfo } from '../../../types/source'
import VersionNav from './VersionNav'
import PostDisplay from './PostDisplay'
import RefinePanel from './RefinePanel'
import ActionBar from './ActionBar'

interface OutputPanelProps {
  output: string
  source: SourceInfo | null
  currentIndex: number
  totalVersions: number
  tone: Tone
  style: Style
  language: Language
  refining: RefineAction | null
  loading: boolean
  onGoToVersion: (index: number) => void
  onRefine: (action: RefineAction, customInstruction?: string, settings?: { tone: Tone; style: Style; language: Language }) => void
  onReset: () => void
}

export default function OutputPanel({
  output, source, currentIndex, totalVersions, tone, style, language,
  refining, loading, onGoToVersion, onRefine, onReset,
}: OutputPanelProps) {
  if (!output) return null

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <VersionNav
        currentIndex={currentIndex}
        totalVersions={totalVersions}
        disabled={!!refining}
        onPrev={() => onGoToVersion(currentIndex - 1)}
        onNext={() => onGoToVersion(currentIndex + 1)}
      />

      <div className="glass-panel overflow-hidden shadow-lg">
        <PostDisplay content={output} source={source} />

        <div className="bg-muted/30 px-6 py-6 border-t border-white/5 flex flex-col gap-6">
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>{output.length} Zeichen</span>
            <span>{loading ? 'Generiere...' : 'Fertig'}</span>
          </div>

          <RefinePanel
            tone={tone} style={style} language={language}
            refining={refining} loading={loading}
            onRefine={onRefine}
          />

          <ActionBar output={output} disabled={!!refining} onReset={onReset} />
        </div>
      </div>
    </div>
  )
}
