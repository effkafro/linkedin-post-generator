import type { TopicInputMode, StoryPoint } from '../../../types/post'
import { STORY_POINT_PLACEHOLDERS, STORY_POINT_LABEL_PLACEHOLDERS } from '../../../constants/storyline'

interface TopicInputProps {
  value: string
  onChange: (value: string) => void
  topicInputMode: TopicInputMode
  onTopicInputModeChange: (mode: TopicInputMode) => void
  storyPoints: StoryPoint[]
  onStoryPointsChange: (points: StoryPoint[]) => void
}

export default function TopicInput({
  value, onChange,
  topicInputMode, onTopicInputModeChange,
  storyPoints, onStoryPointsChange,
}: TopicInputProps) {
  const updateStoryPoint = (index: number, field: 'label' | 'content', val: string) => {
    const updated = storyPoints.map((sp, i) =>
      i === index ? { ...sp, [field]: val } : sp
    )
    onStoryPointsChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none text-foreground/80 pl-1">
          {topicInputMode === 'simple' ? 'Thema' : 'Storyline'}
        </label>
        <div className="flex gap-1 p-0.5 rounded-xl bg-secondary/20">
          <button
            type="button"
            onClick={() => onTopicInputModeChange('simple')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              topicInputMode === 'simple'
                ? 'glass-button shadow-md'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            Thema
          </button>
          <button
            type="button"
            onClick={() => onTopicInputModeChange('storyline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
              topicInputMode === 'storyline'
                ? 'glass-button shadow-md'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            }`}
          >
            Storyline
          </button>
        </div>
      </div>

      {topicInputMode === 'simple' ? (
        <textarea
          id="topic"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Worüber möchtest du schreiben? (z.B. 'Die Zukunft von Remote Work')"
          rows={4}
          className="flex w-full rounded-2xl glass-input px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
        />
      ) : (
        <div className="space-y-3">
          {storyPoints.map((sp, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-sm font-bold text-primary/70 pt-2.5 select-none shrink-0">
                {i + 1}.
              </span>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={sp.label}
                  onChange={e => updateStoryPoint(i, 'label', e.target.value)}
                  placeholder={STORY_POINT_LABEL_PLACEHOLDERS[i]}
                  className="w-full h-8 rounded-xl glass-input px-3 py-1 text-xs font-medium ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 transition-all"
                />
                <textarea
                  value={sp.content}
                  onChange={e => updateStoryPoint(i, 'content', e.target.value)}
                  placeholder={STORY_POINT_PLACEHOLDERS[i]}
                  rows={2}
                  className="flex w-full rounded-2xl glass-input px-4 py-2.5 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
