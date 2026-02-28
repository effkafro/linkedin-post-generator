import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import type { ScrapeRun } from '../../types/analytics'

interface ImportStatusProps {
  lastRun: ScrapeRun | null
  importing: boolean
  importError: string | null
  onImport: (file: File) => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Nie'
  return new Date(dateStr).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ImportStatus({ lastRun, importing, importError, onImport }: ImportStatusProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    onImport(file)
  }, [onImport])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Last import info */}
      {lastRun && (
        <div className="glass-panel p-4 flex items-center gap-4 flex-wrap text-sm">
          <span className="text-muted-foreground">
            Letzter Import:{' '}
            <span className="text-foreground font-medium">
              {formatDate(lastRun.completed_at ?? lastRun.started_at)}
            </span>
          </span>
          {lastRun.file_name && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileSpreadsheet className="w-3 h-3" />
              {lastRun.file_name}
            </span>
          )}
          {lastRun.status === 'success' && (
            <span className="text-xs text-muted-foreground">
              {lastRun.posts_found} gefunden, {lastRun.posts_new} neu, {lastRun.posts_updated} aktualisiert
            </span>
          )}
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !importing && fileInputRef.current?.click()}
        style={{
          backgroundImage: dragOver
            ? 'none'
            : 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
        className={`
          border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 text-center
          ${dragOver
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-muted-foreground/25 hover:border-primary/50 bg-muted/30 hover:bg-primary/5'
          }
          ${importing ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx,.csv"
          onChange={handleFileInput}
          className="hidden"
        />

        {importing ? (
          <div className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-muted-foreground">Importiert...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                Datei hierher ziehen oder klicken
              </p>
              <p className="text-xs text-muted-foreground">
                LinkedIn Analytics Export (XLS, XLSX, CSV)
              </p>
            </div>
          </div>
        )}
      </div>

      {importError && (
        <p className="text-sm text-destructive whitespace-pre-line">{importError}</p>
      )}
    </div>
  )
}
