import { Heart, MessageCircle, Share2, TrendingUp, Eye, MousePointerClick, Percent, MousePointer } from 'lucide-react'
import type { EngagementMetrics, ImpressionMetrics } from '../../types/analytics'

interface MetricsOverviewProps {
  metrics: EngagementMetrics
  impressionMetrics: ImpressionMetrics | null
}

const ENGAGEMENT_CARDS = [
  { key: 'totalEngagement' as const, label: 'Gesamt Engagement', icon: TrendingUp, format: (v: number) => v.toLocaleString('de-DE') },
  { key: 'avgPerPost' as const, label: 'Durchschnitt / Post', icon: Heart, format: (v: number) => v.toLocaleString('de-DE') },
  { key: 'totalPosts' as const, label: 'Anzahl Posts', icon: MessageCircle, format: (v: number) => v.toString() },
  { key: 'topPostEngagement' as const, label: 'Top Post Engagement', icon: Share2, format: (v: number) => v.toLocaleString('de-DE') },
]

const IMPRESSION_CARDS = [
  { key: 'totalImpressions' as const, label: 'Impressions', icon: Eye, format: (v: number) => v.toLocaleString('de-DE') },
  { key: 'avgCTR' as const, label: 'Durchschn. CTR', icon: MousePointerClick, format: (v: number) => `${v.toFixed(2)}%` },
  { key: 'avgEngagementRate' as const, label: 'Durchschn. Engagement Rate', icon: Percent, format: (v: number) => `${v.toFixed(2)}%` },
  { key: 'totalClicks' as const, label: 'Klicks', icon: MousePointer, format: (v: number) => v.toLocaleString('de-DE') },
]

export default function MetricsOverview({ metrics, impressionMetrics }: MetricsOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Engagement KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ENGAGEMENT_CARDS.map(({ key, label, icon: Icon, format }) => (
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

      {/* Impression KPIs - only shown when data is available */}
      {impressionMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {IMPRESSION_CARDS.map(({ key, label, icon: Icon, format }) => (
            <div key={key} className="glass-panel p-5 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {format(impressionMetrics[key])}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
