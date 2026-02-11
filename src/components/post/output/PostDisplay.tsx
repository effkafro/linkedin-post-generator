import type { SourceInfo } from '../../../types/source'
import { formatTextInteractive } from '../../../utils/formatText'

interface PostDisplayProps {
  content: string
  source: SourceInfo | null
}

export default function PostDisplay({ content, source }: PostDisplayProps) {
  return (
    <>
      <div
        className="p-6 md:p-8 whitespace-pre-wrap leading-relaxed text-foreground/90 font-outfit text-lg"
        dangerouslySetInnerHTML={{
          __html: formatTextInteractive(content)
        }}
      />

      {source && (
        <div className="px-6 py-3 bg-white/5 border-t border-white/5 text-xs text-muted-foreground flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider opacity-70">Quelle:</span>
          <div className="flex items-center gap-2 truncate">
            {source.favicon && <img src={source.favicon} alt="" className="w-4 h-4 rounded-sm opacity-70" />}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-primary/80 hover:underline truncate max-w-xs transition-colors"
            >
              {source.title}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
