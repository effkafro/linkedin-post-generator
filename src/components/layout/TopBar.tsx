import UserMenu from '../auth/UserMenu'
import FeedbackButton from '../feedback/FeedbackButton'
import { ModeToggle } from '../theme/mode-toggle'
import ViewSwitcher from './ViewSwitcher'

interface TopBarProps {
  currentView?: string
  onViewChange?: (view: 'workspace' | 'dashboard') => void
  onSidebarOpen: () => void
  onLoginClick: () => void
  onProfileClick: () => void
  onFeedbackClick: () => void
  feedbackPulse?: boolean
  showSidebarToggle?: boolean
}

export default function TopBar({
  currentView, onViewChange, onSidebarOpen, onLoginClick, onProfileClick, onFeedbackClick, feedbackPulse, showSidebarToggle = true
}: TopBarProps) {
  return (
    <>
      {/* Mobile top-left buttons */}
      {showSidebarToggle && (
        <div className="fixed top-4 left-4 z-50 lg:hidden flex items-center gap-2">
          <button
            onClick={onSidebarOpen}
            className="p-2 rounded-xl glass-panel text-foreground hover:bg-white/10 transition-colors"
            aria-label="Verlauf öffnen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* Centered View Switcher */}
      {currentView && onViewChange && (currentView === 'workspace' || currentView === 'dashboard') && (
        <div className={`fixed top-4 z-50 transition-all duration-300 -translate-x-1/2 ${showSidebarToggle ? 'left-1/2 lg:left-[calc(50%+10.75rem)]' : 'left-1/2'
          }`}>
          <ViewSwitcher currentView={currentView} onChange={onViewChange} />
        </div>
      )}

      {/* Right side controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <UserMenu onLoginClick={onLoginClick} onProfileClick={onProfileClick} />
        <FeedbackButton onClick={onFeedbackClick} pulse={feedbackPulse} />
        <ModeToggle />
      </div>
    </>
  )
}
