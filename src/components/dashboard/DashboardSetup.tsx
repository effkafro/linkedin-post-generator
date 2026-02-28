import { useState, useRef, useCallback } from 'react'
import { Upload, BarChart3, FileSpreadsheet } from 'lucide-react'

interface DashboardSetupProps {
  onImport: (file: File) => Promise<void>
  importing: boolean
  importError: string | null
}

const ACCEPTED_TYPES = '.xls,.xlsx,.csv'
export default function DashboardSetup({ onImport, importing, importError }: DashboardSetupProps) {
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name)
    await onImport(file)
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

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-panel p-8 md:p-12 max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Analytics einrichten</h2>
          <p className="text-muted-foreground text-sm">
            Exportiere deine LinkedIn Analytics und lade die Datei hier hoch.
            Wir analysieren Impressions, Engagement und Post-Performance.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            backgroundImage: dragOver
              ? 'none'
              : 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
          className={`
            relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200
            ${dragOver
              ? 'border-primary bg-primary/10 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-primary/50 bg-muted/30 hover:bg-primary/5'
            }
            ${importing ? 'pointer-events-none opacity-60' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileInput}
            className="hidden"
          />

          {importing ? (
            <div className="space-y-3">
              <svg className="w-8 h-8 mx-auto animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-muted-foreground">
                {fileName} wird importiert...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Datei hierher ziehen oder klicken
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  XLS, XLSX oder CSV
                </p>
              </div>
            </div>
          )}
        </div>

        {importError && (
          <p className="text-sm text-destructive whitespace-pre-line">{importError}</p>
        )}

        {/* Instructions */}
        <div className="text-left glass-panel p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            So exportierst du deine Daten:
          </div>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Oeffne LinkedIn und gehe zu deinem Profil</li>
            <li>Klicke auf <span className="text-foreground font-medium">Analytics</span> &rarr; <span className="text-foreground font-medium">Inhalt</span></li>
            <li>Waehle den gewuenschten Zeitraum</li>
            <li>Klicke auf <span className="text-foreground font-medium">Exportieren</span> (Download-Icon)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
