import { useState, useCallback } from 'react'
import PostGenerator from './components/PostGenerator'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import Sidebar from './components/Sidebar'
import PostHistory from './components/PostHistory'
import AuthModal from './components/AuthModal'
import UserMenu from './components/UserMenu'
import { AuthProvider } from './contexts/AuthContext'
import { usePostHistory } from './hooks/usePostHistory'
import type { HistoryItem, InputMode, SourceInfo, JobConfig } from './types/history'
import type { Tone, Style, Language } from './hooks/usePostGenerator'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null)
  const { history, addToHistory, removeFromHistory, clearHistory } = usePostHistory()

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setSelectedHistoryItem(item)
    setSidebarOpen(false)
  }, [])

  const handlePostGenerated = useCallback((data: {
    mode: InputMode
    topic: string
    url?: string
    source?: SourceInfo
    jobConfig?: JobConfig
    tone: Tone
    style: Style
    language: Language
    content: string
  }) => {
    addToHistory(data)
    // Clear selection after generating a new post
    setSelectedHistoryItem(null)
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
      }
    : undefined

  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
          {/* Top bar with toggle buttons */}
          <div className="fixed top-4 left-4 z-50 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md bg-card border border-border text-foreground hover:bg-accent transition-colors"
              aria-label="Verlauf öffnen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <UserMenu onLoginClick={() => setAuthModalOpen(true)} />
            <ModeToggle />
          </div>

        {/* Main layout */}
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
            <PostHistory
              history={history}
              onSelect={handleHistorySelect}
              onDelete={removeFromHistory}
              onClearAll={clearHistory}
            />
          </Sidebar>

          {/* Main content */}
          <main className="flex-1 lg:ml-0">
            <PostGenerator
              key={selectedHistoryItem?.id}
              initialState={initialState}
              onPostGenerated={handlePostGenerated}
            />
          </main>
        </div>

        {/* Auth Modal */}
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    </ThemeProvider>
  </AuthProvider>
  )
}
