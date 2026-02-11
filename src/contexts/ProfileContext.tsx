import { createContext, useContext, type ReactNode } from 'react'
import { useProfile } from '../hooks/useProfile'
import type { VoiceProfile, ExamplePost } from '../types/profile'

interface ProfileContextType {
  profile: VoiceProfile | null
  examplePosts: ExamplePost[]
  loading: boolean
  saving: boolean
  updateProfile: (updates: Partial<VoiceProfile>) => Promise<void>
  addExamplePost: (content: string, performanceNotes?: string) => Promise<void>
  removeExamplePost: (id: string) => Promise<void>
  completeness: number
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const profileState = useProfile()

  return (
    <ProfileContext.Provider value={profileState}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfileContext() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider')
  }
  return context
}
