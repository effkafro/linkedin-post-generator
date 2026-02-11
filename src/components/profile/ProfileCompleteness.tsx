interface ProfileCompletenessProps {
  completeness: number
}

export default function ProfileCompleteness({ completeness }: ProfileCompletenessProps) {
  const color = completeness >= 80 ? 'bg-emerald-500' : completeness >= 50 ? 'bg-primary' : 'bg-amber-500'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">Profil-Vollständigkeit</span>
        <span className="font-semibold">{completeness}%</span>
      </div>
      <div className="h-2 bg-secondary/50 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${completeness}%` }}
        />
      </div>
      {completeness < 50 && (
        <p className="text-xs text-muted-foreground">
          Vervollständige dein Profil für bessere, personalisierte Posts.
        </p>
      )}
    </div>
  )
}
