import type { ReactNode } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

interface AppShellProps {
  sidebarOpen: boolean
  sidebar: ReactNode
  children: ReactNode
  onSidebarOpen: () => void
  onSidebarClose: () => void
  onLoginClick: () => void
  onProfileClick: () => void
  onDashboardClick: () => void
  onHomeClick: () => void
  showHomeButton?: boolean
  showSidebar?: boolean
}

export default function AppShell({
  sidebarOpen, sidebar, children,
  onSidebarOpen, onSidebarClose, onLoginClick, onProfileClick, onDashboardClick, onHomeClick,
  showHomeButton = true, showSidebar = true,
}: AppShellProps) {
  return (
    <div className="relative text-foreground transition-colors duration-300">
      <TopBar
        onSidebarOpen={onSidebarOpen}
        onLoginClick={onLoginClick}
        onProfileClick={onProfileClick}
        onDashboardClick={onDashboardClick}
        onHomeClick={onHomeClick}
        showHomeButton={showHomeButton}
        showSidebarToggle={showSidebar}
      />

      <div className="flex min-h-screen p-4 lg:p-6 gap-6">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={onSidebarClose}>
            {sidebar}
          </Sidebar>
        )}

        <main className="flex-1 lg:ml-0 w-full max-w-5xl mx-auto flex flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}
