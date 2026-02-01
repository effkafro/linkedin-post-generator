import { useEffect } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Sidebar({ isOpen, onClose, children }: SidebarProps) {
  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-0
          h-screen w-80 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          lg:transform-none lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent lg:hidden transition-colors"
          aria-label="Sidebar schließen"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {children}
      </aside>
    </>
  )
}
