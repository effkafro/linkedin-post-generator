import { Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react'
import type { EngagementMetrics } from '../../types/analytics'

interface MetricsOverviewProps {
  metrics: EngagementMetrics
}

const CARDS = [
  { key: 'totalEngagement' as const, label: 'Gesamt Engagement', icon: TrendingUp, format: (v: number) => v.toLocaleString('de-DE') },
  { key: 'avgPerPost' as const, label: 'Durchschnitt / Post', icon: Heart, format: (v: number) => v.toLocaleString('de-DE') },
  { key: 'totalPosts' as const, label: 'Anzahl Posts', icon: MessageCircle, format: (v: number) => v.toString() },
  { key: 'topPostEngagement' as const, label: 'Top Post Engagement', icon: Share2, format: (v: number) => v.toLocaleString('de-DE') },
]

export default function MetricsOverview({ metrics }: MetricsOverviewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, format }) => (
        <div key={key} className="glass-panel p-5 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">{label}</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {format(metrics[key])}
          </p>
        </div>
      ))}
    </div>
  )
}
