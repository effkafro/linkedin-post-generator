import { useProfileContext } from '../../contexts/ProfileContext'
import ProfileCompleteness from './ProfileCompleteness'
import ProfileForm from './ProfileForm'
import VoiceSettings from './VoiceSettings'
import ExamplePosts from './ExamplePosts'

interface ProfilePageProps {
  onClose: () => void
}

export default function ProfilePage({ onClose }: ProfilePageProps) {
  const { profile, examplePosts, loading, saving, updateProfile, addExamplePost, removeExamplePost, completeness } = useProfileContext()

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-gradient">Mein Profil</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Trainiere deine persönliche Voice für bessere Posts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-button h-10 px-4 text-sm font-medium"
          >
            Zurück
          </button>
        </div>

        {/* Completeness */}
        <div className="glass-panel p-6">
          <ProfileCompleteness completeness={completeness} />
        </div>

        {/* Profile Form */}
        <div className="glass-panel p-6 md:p-8">
          <ProfileForm profile={profile} onUpdate={updateProfile} />
        </div>

        {/* Voice Settings */}
        <div className="glass-panel p-6 md:p-8">
          <VoiceSettings profile={profile} onUpdate={updateProfile} />
        </div>

        {/* Example Posts */}
        <div className="glass-panel p-6 md:p-8">
          <ExamplePosts
            posts={examplePosts}
            onAdd={addExamplePost}
            onRemove={removeExamplePost}
          />
        </div>

        {saving && (
          <div className="fixed bottom-6 right-6 glass-panel px-4 py-2 text-sm font-medium text-primary animate-in fade-in slide-in-from-bottom-2">
            Wird gespeichert...
          </div>
        )}
      </div>
    </div>
  )
}
