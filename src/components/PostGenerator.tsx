import { useState } from 'react'
import { usePostGenerator, type Tone, type Style, type RefineAction } from '../hooks/usePostGenerator'

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'educational', label: 'Educational' },
]

const STYLE_OPTIONS: { value: Style; label: string }[] = [
  { value: 'story', label: 'Story' },
  { value: 'listicle', label: 'Listicle' },
  { value: 'question-hook', label: 'Question-Hook' },
  { value: 'bold-statement', label: 'Bold-Statement' },
]

const REFINE_OPTIONS: { action: RefineAction; label: string }[] = [
  { action: 'shorter', label: 'Kürzer' },
  { action: 'longer', label: 'Länger' },
  { action: 'formal', label: 'Formeller' },
  { action: 'casual', label: 'Lockerer' },
]

export default function PostGenerator() {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<Tone>('professional')
  const [style, setStyle] = useState<Style>('story')
  const [copied, setCopied] = useState(false)

  const {
    output,
    loading,
    refining,
    error,
    versions,
    currentIndex,
    generate,
    refine,
    goToVersion,
    reset
  } = usePostGenerator()

  const handleGenerate = () => {
    generate({ topic, tone, style })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setTopic('')
    setTone('professional')
    setStyle('story')
    reset()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">LinkedIn Post Generator</h1>
          <p className="text-gray-500">Generiere professionelle LinkedIn-Posts mit KI</p>
        </header>

        {/* Form */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
          {/* Topic Textarea */}
          <div className="mb-5">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-400 mb-2">
              Thema
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Beschreibe das Thema deines LinkedIn Posts..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#333] bg-[#0a0a0a] text-gray-200 text-sm outline-none focus:border-[#2563eb] transition-colors resize-none"
            />
          </div>

          {/* Dropdowns Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-400 mb-2">
                Ton
              </label>
              <select
                id="tone"
                value={tone}
                onChange={e => setTone(e.target.value as Tone)}
                className="w-full px-4 py-3 rounded-xl border border-[#333] bg-[#0a0a0a] text-gray-200 text-sm outline-none focus:border-[#2563eb] transition-colors cursor-pointer"
              >
                {TONE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-400 mb-2">
                Stil
              </label>
              <select
                id="style"
                value={style}
                onChange={e => setStyle(e.target.value as Style)}
                className="w-full px-4 py-3 rounded-xl border border-[#333] bg-[#0a0a0a] text-gray-200 text-sm outline-none focus:border-[#2563eb] transition-colors cursor-pointer"
              >
                {STYLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full px-6 py-3 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
                Generiere...
              </>
            ) : (
              'Generieren'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            {/* Header with Version Navigation */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-400">Generierter Post</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Version {currentIndex + 1}/{versions.length}
                </span>
                <button
                  onClick={() => goToVersion(currentIndex - 1)}
                  disabled={currentIndex <= 0 || !!refining}
                  className="p-1.5 rounded-lg border border-[#333] text-gray-400 hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Vorherige Version"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => goToVersion(currentIndex + 1)}
                  disabled={currentIndex >= versions.length - 1 || !!refining}
                  className="p-1.5 rounded-lg border border-[#333] text-gray-400 hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Nächste Version"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="bg-[#0a0a0a] border border-[#333] rounded-xl p-4 mb-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200">{output}</p>
              <div className="mt-3 pt-3 border-t border-[#333] flex justify-end">
                <span className="text-xs text-gray-600">{output.length} Zeichen</span>
              </div>
            </div>

            {/* Refine Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {REFINE_OPTIONS.map(({ action, label }) => (
                <button
                  key={action}
                  onClick={() => refine(action)}
                  disabled={!!refining || loading}
                  className="px-3 py-2 rounded-xl border border-[#333] text-gray-300 text-xs font-medium hover:bg-[#2a2a2a] hover:border-[#444] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {refining === action ? (
                    <>
                      <span className="animate-spin">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </span>
                      {label}...
                    </>
                  ) : (
                    label
                  )}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                disabled={!!refining}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#333] text-gray-300 text-sm font-medium hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kopiert!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Kopieren
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={!!refining}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#333] text-gray-300 text-sm font-medium hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Neu generieren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
