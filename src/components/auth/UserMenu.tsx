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
        className="inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
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
        className={`flex items-center gap-2 p-1 rounded-full transition-all duration-300 border ${isOpen
            ? 'bg-secondary/60 border-border/50 shadow-sm'
            : 'hover:bg-secondary/50 border-transparent hover:border-border/40'
          }`}
        aria-label="User menu"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name || 'User'}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-border/50 shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-sm font-semibold ring-1 ring-border/50 shadow-sm backdrop-blur-md">
            {(profile?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 glass-panel-elevated p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 origin-top-right">
          {/* User Info */}
          <div className="p-5 border-b border-border/40 bg-card/30">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'User'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-xl font-bold ring-1 ring-border/50 shadow-inner">
                  {(profile?.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-foreground text-base">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Plan & Usage */}
          <div className="p-5 border-b border-border/40 space-y-4 bg-card/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Aktueller Plan</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border shadow-sm ${plan === 'free'
                  ? 'bg-secondary/60 text-secondary-foreground border-border/50'
                  : 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]'
                }`}>
                {PLAN_LABELS[plan]}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Posts diesen Monat</span>
                <span className="font-semibold text-foreground">
                  {postsThisMonth}{!isUnlimited && <span className="text-muted-foreground font-medium"> / {limit}</span>}
                </span>
              </div>
              {!isUnlimited && (
                <div className="h-1.5 bg-secondary/60 rounded-full overflow-hidden border border-border/30 shadow-inner">
                  <div
                    className={`h-full transition-all duration-700 ease-out rounded-full relative ${postsThisMonth >= limit
                        ? 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : 'bg-primary shadow-[0_0_10px_rgba(14,165,233,0.4)]'
                      }`}
                    style={{ width: `${Math.min((postsThisMonth / limit) * 100, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full mix-blend-overlay"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-2.5 space-y-1 bg-card/20">
            {onProfileClick && (
              <button
                className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-secondary/60 text-foreground transition-all flex items-center gap-3 group border border-transparent hover:border-border/30 hover:shadow-sm"
                onClick={() => {
                  setIsOpen(false)
                  onProfileClick()
                }}
              >
                <div className="p-1.5 rounded-lg bg-secondary/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 group-hover:scale-110 shadow-sm border border-border/20 group-hover:border-primary/20 group-hover:shadow-[0_0_8px_rgba(14,165,233,0.15)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Mein Profil
              </button>
            )}
            {plan === 'free' && (
              <button
                className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/5 text-foreground hover:text-primary transition-all flex items-center gap-3 group border border-transparent hover:border-primary/10 hover:shadow-sm"
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Open upgrade modal
                }}
              >
                <div className="p-1.5 rounded-lg bg-secondary/80 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300 group-hover:scale-110 shadow-sm border border-border/20 group-hover:border-primary/30 group-hover:shadow-[0_0_8px_rgba(14,165,233,0.2)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Upgrade auf Pro
              </button>
            )}
            <button
              className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-destructive/5 text-foreground hover:text-destructive transition-all flex items-center gap-3 group border border-transparent hover:border-destructive/10 hover:shadow-sm"
              onClick={() => {
                setIsOpen(false)
                signOut()
              }}
            >
              <div className="p-1.5 rounded-lg bg-secondary/80 text-muted-foreground group-hover:bg-destructive/15 group-hover:text-destructive transition-all duration-300 group-hover:scale-110 shadow-sm border border-border/20 group-hover:border-destructive/30 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.2)]">
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
