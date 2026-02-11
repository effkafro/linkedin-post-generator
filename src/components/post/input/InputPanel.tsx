import type { InputMode, Tone, Style, Language } from '../../../types/post'
import type { JobConfig } from '../../../types/job'
import { isValidUrl } from '../../../utils/urlValidation'
import ModeTabs from './ModeTabs'
import TopicInput from './TopicInput'
import UrlInput from './UrlInput'
import JobInput from './JobInput'
import SettingsRow from './SettingsRow'
import GenerateButton from './GenerateButton'

interface InputPanelProps {
  mode: InputMode
  topic: string
  url: string
  jobConfig: JobConfig
  tone: Tone
  style: Style
  language: Language
  loading: boolean
  onModeChange: (mode: InputMode) => void
  onTopicChange: (topic: string) => void
  onUrlChange: (url: string) => void
  onJobConfigChange: (updates: Partial<JobConfig>) => void
  onToneChange: (tone: Tone) => void
  onStyleChange: (style: Style) => void
  onLanguageChange: (language: Language) => void
  onGenerate: () => void
  useProfile: boolean
  onUseProfileChange: (enabled: boolean) => void
  profileAvailable: boolean
  profileCompleteness: number
}

export default function InputPanel({
  mode, topic, url, jobConfig, tone, style, language, loading,
  onModeChange, onTopicChange, onUrlChange, onJobConfigChange,
  onToneChange, onStyleChange, onLanguageChange, onGenerate,
  useProfile, onUseProfileChange, profileAvailable, profileCompleteness,
}: InputPanelProps) {
  const canGenerate = (() => {
    if (mode === 'topic') return !!topic.trim()
    if (mode === 'url') return !!url.trim() && isValidUrl(url)
    if (mode === 'job') {
      if (jobConfig.hasExistingPosting) {
        return !!jobConfig.jobUrl?.trim() && isValidUrl(jobConfig.jobUrl)
      }
      return !!jobConfig.jobTitle?.trim()
    }
    return false
  })()

  return (
    <div className="glass-panel text-card-foreground transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.1)]">
      <div className="p-6 md:p-8 space-y-8">
        <ModeTabs mode={mode} onChange={onModeChange} />

        {mode === 'topic' && <TopicInput value={topic} onChange={onTopicChange} />}
        {mode === 'url' && <UrlInput value={url} onChange={onUrlChange} />}
        {mode === 'job' && (
          <JobInput
            jobConfig={jobConfig}
            topic={topic}
            onJobConfigChange={onJobConfigChange}
            onTopicChange={onTopicChange}
          />
        )}

        <SettingsRow
          tone={tone} style={style} language={language}
          onToneChange={onToneChange} onStyleChange={onStyleChange} onLanguageChange={onLanguageChange}
          useProfile={useProfile} onUseProfileChange={onUseProfileChange}
          profileAvailable={profileAvailable} profileCompleteness={profileCompleteness}
        />

        <GenerateButton
          loading={loading}
          disabled={!canGenerate}
          mode={mode}
          onClick={onGenerate}
        />
      </div>
    </div>
  )
}
