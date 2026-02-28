import { Home } from 'lucide-react'
import UserMenu from '../auth/UserMenu'
import { ModeToggle } from '../theme/mode-toggle'

interface TopBarProps {
  onSidebarOpen: () => void
  onLoginClick: () => void
  onProfileClick: () => void
  onDashboardClick: () => void
  onHomeClick: () => void
  showHomeButton?: boolean
  showSidebarToggle?: boolean
}

export default function TopBar({ onSidebarOpen, onLoginClick, onProfileClick, onDashboardClick, onHomeClick, showHomeButton = true, showSidebarToggle = true }: TopBarProps) {
  return (
    <>
      {/* Mobile top-left buttons */}
      {(showHomeButton || showSidebarToggle) && (
        <div className="fixed top-4 left-4 z-50 lg:hidden flex items-center gap-2">
          {showHomeButton && (
            <button
              onClick={onHomeClick}
              className="p-2 rounded-xl glass-panel text-foreground hover:bg-white/10 transition-colors"
              aria-label="Zur Startseite"
            >
              <Home className="w-5 h-5" />
            </button>
          )}
          {showSidebarToggle && (
            <button
              onClick={onSidebarOpen}
              className="p-2 rounded-xl glass-panel text-foreground hover:bg-white/10 transition-colors"
              aria-label="Verlauf öffnen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Desktop home button */}
      {showHomeButton && (
        <div className="fixed top-4 left-4 z-50 hidden lg:block">
          <button
            onClick={onHomeClick}
            className="p-2 rounded-xl glass-panel text-foreground hover:bg-white/10 transition-colors"
            aria-label="Zur Startseite"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Right side controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <UserMenu onLoginClick={onLoginClick} onProfileClick={onProfileClick} onDashboardClick={onDashboardClick} />
        <ModeToggle />
      </div>
    </>
  )
}
