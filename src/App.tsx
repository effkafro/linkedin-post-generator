import { useState, useCallback, useRef } from 'react'
import PostWorkspace from './components/post/PostWorkspace'
import ProfilePage from './components/profile/ProfilePage'
import { ThemeProvider } from './components/theme/theme-provider'
import AppShell from './components/layout/AppShell'
import PostHistory from './components/history/PostHistory'
import AuthModal from './components/auth/AuthModal'
import { AuthProvider } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { usePostHistory } from './hooks/usePostHistory'
import type { HistoryItem } from './types/history'
import type { InputMode, Tone, Style, Language, SerializedPostVersion } from './types/post'
import type { JobConfig } from './types/job'
import type { SourceInfo } from './types/source'

type AppView = 'workspace' | 'profile'

// Inner component that uses hooks requiring AuthProvider
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState<AppView>('workspace')
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null)
  const [hasActivePost, setHasActivePost] = useState(false)
  const [resetCounter, setResetCounter] = useState(0)
  const { history, addToHistory, updateHistoryItem, removeFromHistory, clearHistory } = usePostHistory()

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
    <>
      <AppShell
        sidebarOpen={sidebarOpen}
        onSidebarOpen={() => setSidebarOpen(true)}
        onSidebarClose={() => setSidebarOpen(false)}
        onLoginClick={() => setAuthModalOpen(true)}
        onProfileClick={() => setCurrentView('profile')}
        sidebar={
          <PostHistory
            history={history}
            onSelect={handleHistorySelect}
            onDelete={removeFromHistory}
            onClearAll={clearHistory}
            onNewPost={handleNewPost}
            hasActivePost={hasActivePost}
          />
        }
      >
        {currentView === 'profile' ? (
          <ProfilePage onClose={() => setCurrentView('workspace')} />
        ) : (
          <PostWorkspace
            key={selectedHistoryItem?.id ?? `fresh-${resetCounter}`}
            initialState={initialState}
            onPostGenerated={handlePostGenerated}
            onVersionsChange={handleVersionsChange}
          />
        )}
      </AppShell>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}

// Main App component wraps everything with providers
export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppContent />
        </ThemeProvider>
      </ProfileProvider>
    </AuthProvider>
  )
}
