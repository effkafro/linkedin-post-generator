interface TopicInputProps {
  value: string
  onChange: (value: string) => void
}

export default function TopicInput({ value, onChange }: TopicInputProps) {
  return (
    <div className="space-y-3">
      <label htmlFor="topic" className="text-sm font-medium leading-none text-foreground/80 pl-1">
        Thema
      </label>
      <textarea
        id="topic"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Worüber möchtest du schreiben? (z.B. 'Die Zukunft von Remote Work')"
        rows={4}
        className="flex w-full rounded-2xl glass-input px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
      />
    </div>
  )
}
