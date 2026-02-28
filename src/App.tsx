import { useState, useCallback, useRef, useMemo } from 'react'
import PostWorkspace from './components/post/PostWorkspace'
import ProfilePage from './components/profile/ProfilePage'
import DashboardPage from './components/dashboard/DashboardPage'
import HomePage from './components/home/HomePage'
import { ThemeProvider } from './components/theme/theme-provider'
import AppShell from './components/layout/AppShell'
import PostHistory from './components/history/PostHistory'
import AuthModal from './components/auth/AuthModal'
import { AuthProvider } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { usePostHistory } from './hooks/usePostHistory'
import type { HistoryItem } from './types/history'
import type { InputMode, Tone, Style, Language, SerializedPostVersion, StoryPoint } from './types/post'
import type { JobConfig } from './types/job'
import type { SourceInfo } from './types/source'

type AppView = 'home' | 'workspace' | 'profile' | 'dashboard'

// Inner component that uses hooks requiring AuthProvider
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null)
  const [hasActivePost, setHasActivePost] = useState(false)
  const [resetCounter, setResetCounter] = useState(0)
  const { history, addToHistory, updateHistoryItem, removeFromHistory, clearHistory } = usePostHistory()

  const currentPostDataRef = useRef<{ versions: SerializedPostVersion[], content: string } | null>(null)

  const handleVersionsChange = useCallback((data: { versions: SerializedPostVersion[], content: string } | null) => {
    currentPostDataRef.current = data
    setHasActivePost(data !== null && data.versions.length > 0)

    // Auto-save: persist versions to history immediately after refinement
    if (selectedHistoryItem && data && data.versions.length > 1) {
      updateHistoryItem(selectedHistoryItem.id, {
        content: data.content,
        charCount: data.content.length,
        versions: data.versions,
      })
    }
  }, [selectedHistoryItem, updateHistoryItem])

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
    storyPoints?: StoryPoint[]
  }) => {
    const newItem = await addToHistory(data)
    if (newItem) {
      setSelectedHistoryItem(newItem)
    }
  }, [addToHistory])

  const initialState = useMemo(() =>
    selectedHistoryItem
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
        storyPoints: selectedHistoryItem.storyPoints,
      }
      : undefined,
    [selectedHistoryItem]
  )

  return (
    <>
      <AppShell
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        sidebarOpen={sidebarOpen}
        onSidebarOpen={() => setSidebarOpen(true)}
        onSidebarClose={() => setSidebarOpen(false)}
        onLoginClick={() => setAuthModalOpen(true)}
        onProfileClick={() => setCurrentView('profile')}
        showSidebar={currentView === 'workspace'}
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
        {currentView === 'home' ? (
          <HomePage
            onSelectCreator={() => setCurrentView('workspace')}
            onSelectDashboard={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'dashboard' ? (
          <DashboardPage />
        ) : currentView === 'profile' ? (
          <ProfilePage onClose={() => setCurrentView('home')} />
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
