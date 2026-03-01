import type { ReactNode } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

interface AppShellProps {
  currentView?: string
  onViewChange?: (view: 'workspace' | 'dashboard') => void
  sidebarOpen: boolean
  sidebar: ReactNode
  children: ReactNode
  onSidebarOpen: () => void
  onSidebarClose: () => void
  onLoginClick: () => void
  onProfileClick: () => void
  onFeedbackClick: () => void
  feedbackPulse?: boolean
  showSidebar?: boolean
}

export default function AppShell({
  currentView, onViewChange,
  sidebarOpen, sidebar, children,
  onSidebarOpen, onSidebarClose, onLoginClick, onProfileClick, onFeedbackClick,
  feedbackPulse,
  showSidebar = true,
}: AppShellProps) {
  return (
    <div className="relative text-foreground transition-colors duration-300">
      <TopBar
        currentView={currentView}
        onViewChange={onViewChange}
        onSidebarOpen={onSidebarOpen}
        onLoginClick={onLoginClick}
        onProfileClick={onProfileClick}
        onFeedbackClick={onFeedbackClick}
        feedbackPulse={feedbackPulse}
        showSidebarToggle={showSidebar}
      />

      <div className="flex min-h-screen p-4 lg:p-6 gap-6">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={onSidebarClose}>
            {sidebar}
          </Sidebar>
        )}

        <main className="flex-1 w-full flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
