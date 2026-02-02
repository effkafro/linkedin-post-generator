import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

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
}

export default function UserMenu({ onLoginClick }: UserMenuProps) {
  const { user, profile, loading, signOut, isConfigured } = useAuth()
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

  if (!isConfigured) {
    return null
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
        className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors"
        aria-label="User menu"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || 'User'}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {(profile?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-card text-card-foreground border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {(profile?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Plan & Usage */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                plan === 'free'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary/10 text-primary'
              }`}>
                {PLAN_LABELS[plan]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Posts diesen Monat</span>
              <span className="text-sm font-medium">
                {postsThisMonth}{isUnlimited ? '' : ` / ${limit}`}
              </span>
            </div>
            {!isUnlimited && (
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    postsThisMonth >= limit ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min((postsThisMonth / limit) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-2">
            {plan === 'free' && (
              <button
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center gap-2"
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Open upgrade modal
                }}
              >
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Upgrade auf Pro
              </button>
            )}
            <button
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center gap-2 text-destructive"
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
