import type { ReactNode } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import Footer from './Footer'

interface AppShellProps {
  currentView?: string
  onViewChange?: (view: 'workspace' | 'dashboard') => void
  onNavigate?: (view: 'impressum' | 'privacy' | 'terms') => void
  sidebarOpen: boolean
  sidebar: ReactNode
  children: ReactNode
  onSidebarOpen: () => void
  onSidebarClose: () => void
  onLoginClick: () => void
  onProfileClick: () => void
  showSidebar?: boolean
}

export default function AppShell({
  currentView, onViewChange, onNavigate,
  sidebarOpen, sidebar, children,
  onSidebarOpen, onSidebarClose, onLoginClick, onProfileClick,
  showSidebar = true,
}: AppShellProps) {
  return (
    <div className="relative text-foreground transition-colors duration-300 flex flex-col min-h-screen">
      <TopBar
        currentView={currentView}
        onViewChange={onViewChange}
        onSidebarOpen={onSidebarOpen}
        onLoginClick={onLoginClick}
        onProfileClick={onProfileClick}
        showSidebarToggle={showSidebar}
      />

      <div className="flex flex-1 p-4 lg:p-6 pb-14 gap-6">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={onSidebarClose}>
            {sidebar}
          </Sidebar>
        )}

        <main className="flex-1 w-full flex flex-col min-w-0">
          {children}
        </main>
      </div>

      {onNavigate && <Footer onNavigate={onNavigate} />}
    </div>
  )
}
