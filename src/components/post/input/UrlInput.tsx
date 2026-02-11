import { isValidUrl } from '../../../utils/urlValidation'

interface UrlInputProps {
  value: string
  onChange: (value: string) => void
}

export default function UrlInput({ value, onChange }: UrlInputProps) {
  const showError = value && !isValidUrl(value)

  return (
    <div className="space-y-3">
      <label htmlFor="url" className="text-sm font-medium leading-none text-foreground/80 pl-1">
        Artikel-URL
      </label>
      <input
        id="url"
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://example.com/blog-artikel"
        className={`flex w-full h-12 rounded-2xl glass-input px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${showError
          ? 'border-destructive/50 ring-destructive/50 focus-visible:ring-destructive/50'
          : ''
          }`}
      />
      {showError && (
        <p className="text-xs text-destructive">Bitte gib eine gültige URL ein (z.B. https://...)</p>
      )}
      <p className="text-xs text-muted-foreground">
        Füge eine Blog- oder Artikel-URL ein, um den Inhalt als LinkedIn-Post aufzubereiten.
      </p>
    </div>
  )
}
