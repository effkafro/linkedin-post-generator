import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  creator: 'Creator',
  pro: 'Pro',
  team: 'Team',
  agency: 'Agency',
}

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  creator: 50,
  pro: -1, // unlimited
  team: -1,
  agency: -1,
}

interface UserMenuProps {
  onLoginClick: () => void
  onProfileClick?: () => void
}

export default function UserMenu({ onLoginClick, onProfileClick }: UserMenuProps) {
  const { user, profile, loading, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
    )
  }



  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Anmelden
      </button>
    )
  }

  const plan = profile?.plan || 'free'
  const postsThisMonth = profile?.posts_this_month || 0
  const limit = PLAN_LIMITS[plan]
  const isUnlimited = limit === -1

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary/50 transition-colors border border-transparent hover:border-white/5"
        aria-label="User menu"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || 'User'}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-background"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold ring-2 ring-background backdrop-blur-md">
            {(profile?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 glass-panel p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* User Info */}
          <div className="p-5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-semibold ring-2 ring-white/10 backdrop-blur-md">
                  {(profile?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-foreground">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Plan & Usage */}
          <div className="p-5 border-b border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Aktueller Plan</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${plan === 'free'
                ? 'bg-secondary/50 text-muted-foreground border-white/5'
                : 'bg-primary/20 text-primary border-primary/20'
                }`}>
                {PLAN_LABELS[plan]}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Posts diesen Monat</span>
                <span className="font-medium">
                  {postsThisMonth}{isUnlimited ? '' : ` / ${limit}`}
                </span>
              </div>
              {!isUnlimited && (
                <div className="h-2 bg-secondary/50 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${postsThisMonth >= limit ? 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                      }`}
                    style={{ width: `${Math.min((postsThisMonth / limit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 bg-black/20">
            {onProfileClick && (
              <button
                className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/10 hover:text-foreground transition-all flex items-center gap-3 group"
                onClick={() => {
                  setIsOpen(false)
                  onProfileClick()
                }}
              >
                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Mein Profil
              </button>
            )}
            {plan === 'free' && (
              <button
                className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-primary/20 hover:text-primary transition-all flex items-center gap-3 group"
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Open upgrade modal
                }}
              >
                <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Upgrade auf Pro
              </button>
            )}
            <button
              className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all flex items-center gap-3 group"
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
            >
              <div className="p-1.5 rounded-md bg-destructive/10 text-destructive group-hover:bg-destructive/20 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
