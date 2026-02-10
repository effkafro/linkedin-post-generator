import { useState, useCallback, useRef } from 'react'
import PostGenerator from './components/PostGenerator'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import Sidebar from './components/Sidebar'
import PostHistory from './components/PostHistory'
import AuthModal from './components/AuthModal'
import UserMenu from './components/UserMenu'
import { AuthProvider } from './contexts/AuthContext'
import { usePostHistory } from './hooks/usePostHistory'
import type { HistoryItem, InputMode, SourceInfo, JobConfig, SerializedPostVersion } from './types/history'
import type { Tone, Style, Language } from './hooks/usePostGenerator'

// Inner component that uses hooks requiring AuthProvider
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null)
  const [hasActivePost, setHasActivePost] = useState(false)
  const [resetCounter, setResetCounter] = useState(0)
  const { history, addToHistory, updateHistoryItem, removeFromHistory, clearHistory } = usePostHistory()

  // Ref to hold the current post's version data from PostGenerator
  const currentPostDataRef = useRef<{ versions: SerializedPostVersion[], content: string } | null>(null)

  const handleVersionsChange = useCallback((data: { versions: SerializedPostVersion[], content: string } | null) => {
    currentPostDataRef.current = data
    setHasActivePost(data !== null && data.versions.length > 0)
  }, [])

  const saveCurrentVersions = useCallback(async () => {
    if (selectedHistoryItem && currentPostDataRef.current) {
      const { versions, content } = currentPostDataRef.current
      await updateHistoryItem(selectedHistoryItem.id, {
        content,
        charCount: content.length,
        versions,
      })
    }
  }, [selectedHistoryItem, updateHistoryItem])

  const handleNewPost = useCallback(async () => {
    await saveCurrentVersions()
    setSelectedHistoryItem(null)
    setResetCounter(c => c + 1)
    currentPostDataRef.current = null
    setHasActivePost(false)
  }, [saveCurrentVersions])

  const handleHistorySelect = useCallback(async (item: HistoryItem) => {
    // Auto-save current versions before switching
    await saveCurrentVersions()
    setSelectedHistoryItem(item)
    setSidebarOpen(false)
  }, [saveCurrentVersions])

  const handlePostGenerated = useCallback(async (data: {
    mode: InputMode
    topic: string
    url?: string
    source?: SourceInfo
    jobConfig?: JobConfig
    tone: Tone
    style: Style
    language: Language
    content: string
    versions?: SerializedPostVersion[]
  }) => {
    const newItem = await addToHistory(data)
    if (newItem) {
      setSelectedHistoryItem(newItem)
    }
  }, [addToHistory])

  const initialState = selectedHistoryItem
    ? {
      mode: selectedHistoryItem.mode,
      topic: selectedHistoryItem.topic,
      url: selectedHistoryItem.url,
      source: selectedHistoryItem.source,
      jobConfig: selectedHistoryItem.jobConfig,
      tone: selectedHistoryItem.tone,
      style: selectedHistoryItem.style,
      language: selectedHistoryItem.language,
      content: selectedHistoryItem.content,
      versions: selectedHistoryItem.versions,
    }
    : undefined

  return (
    <div className="relative text-foreground transition-colors duration-300">
      {/* Top bar with toggle buttons */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl glass-panel text-foreground hover:bg-white/10 transition-colors"
          aria-label="Verlauf öffnen"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <UserMenu onLoginClick={() => setAuthModalOpen(true)} />
        <ModeToggle />
      </div>

      {/* Main layout */}
      <div className="flex min-h-screen p-4 lg:p-6 gap-6">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <PostHistory
            history={history}
            onSelect={handleHistorySelect}
            onDelete={removeFromHistory}
            onClearAll={clearHistory}
            onNewPost={handleNewPost}
            hasActivePost={hasActivePost}
          />
        </Sidebar>

        {/* Main content */}
        <main className="flex-1 lg:ml-0 w-full max-w-5xl mx-auto flex flex-col">
          <PostGenerator
            key={selectedHistoryItem?.id ?? `fresh-${resetCounter}`}
            initialState={initialState}
            onPostGenerated={handlePostGenerated}
            onVersionsChange={handleVersionsChange}
          />
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  )
}

// Main App component wraps everything with providers
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}
