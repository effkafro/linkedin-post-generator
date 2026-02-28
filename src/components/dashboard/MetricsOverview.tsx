import { useState } from 'react'
import { Heart, MessageCircle, Share2, TrendingUp, Eye, MousePointerClick, Percent, MousePointer, BarChart3, HelpCircle, type LucideIcon } from 'lucide-react'
import type { EngagementMetrics, ImpressionMetrics, ExportType } from '../../types/analytics'

interface MetricsOverviewProps {
  metrics: EngagementMetrics
  impressionMetrics: ImpressionMetrics | null
  exportType: ExportType
}

interface CardConfig {
  key: string
  label: string
  icon: LucideIcon
  format: (v: number) => string
  tooltip: string
}

// --- Tooltip Component ---

function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <HelpCircle className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 text-xs text-foreground bg-popover border border-border rounded-lg shadow-lg whitespace-normal leading-relaxed pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
        </span>
      )}
    </span>
  )
}

// --- Card Definitions ---

const COMPANY_ENGAGEMENT_CARDS: CardConfig[] = [
  { key: 'totalEngagement', label: 'Gesamt Engagement', icon: TrendingUp, format: (v) => v.toLocaleString('de-DE'),
    tooltip: 'Summe aller Reactions + Comments + Shares ueber alle Posts im gewaehlten Zeitraum.' },
  { key: 'avgPerPost', label: 'Durchschnitt / Post', icon: Heart, format: (v) => v.toLocaleString('de-DE'),
    tooltip: 'Gesamt Engagement geteilt durch Anzahl Posts. Zeigt die durchschnittliche Interaktion pro Beitrag.' },
  { key: 'totalPosts', label: 'Anzahl Posts', icon: MessageCircle, format: (v) => v.toString(),
    tooltip: 'Anzahl importierter Posts im gewaehlten Zeitraum.' },
  { key: 'topPostEngagement', label: 'Top Post Engagement', icon: Share2, format: (v) => v.toLocaleString('de-DE'),
    tooltip: 'Hoechstes Engagement eines einzelnen Posts (Reactions + Comments + Shares).' },
]

const PERSONAL_ENGAGEMENT_CARDS: CardConfig[] = [
  { key: 'totalEngagement', label: 'Gesamt Engagements', icon: TrendingUp, format: (v) => v.toLocaleString('de-DE'),
    tooltip: 'Summe aller Engagements ueber die Top Posts. Beim Privatprofil-Export sind Reactions, Comments und Shares nicht einzeln aufgeschluesselt.' },
  { key: 'avgPerPost', label: 'Durchschnitt / Post', icon: BarChart3, format: (v) => v.toLocaleString('de-DE'),
    tooltip: 'Gesamt Engagements geteilt durch Anzahl Posts.' },
  { key: 'totalPosts', label: 'Anzahl Posts', icon: MessageCircle, format: (v) => v.toString(),
    tooltip: 'Anzahl Posts aus dem TOP POSTS Sheet (max. 50 Posts verfuegbar).' },
  { key: 'topPostEngagement', label: 'Top Post Engagements', icon: TrendingUp, format: (v) => v.toLocaleString('de-DE'),
    tooltip: 'Hoechstes Engagement eines einzelnen Posts.' },
]

const IMPRESSION_CARDS: CardConfig[] = [
  { key: 'totalImpressions', label: 'Impressions', icon: Eye, format: (v) => v.toLocaleString('de-DE'),
    tooltip: 'Gesamtzahl der Impressionen ueber alle Posts. Jede Anzeige im Feed zaehlt als eine Impression.' },
  { key: 'avgCTR', label: 'Durchschn. CTR', icon: MousePointerClick, format: (v) => `${v.toFixed(2)}%`,
    tooltip: 'Click-Through-Rate: Klicks geteilt durch Impressions, gemittelt ueber alle Posts mit Impressionen.' },
  { key: 'avgEngagementRate', label: 'Durchschn. Engagement Rate', icon: Percent, format: (v) => `${v.toFixed(2)}%`,
    tooltip: 'Engagement geteilt durch Impressions pro Post, dann gemittelt. Zeigt wie interaktiv die Reichweite ist.' },
  { key: 'totalClicks', label: 'Klicks', icon: MousePointer, format: (v) => v.toLocaleString('de-DE'),
    tooltip: 'Gesamtzahl der Klicks auf alle Posts (Links, Bilder, \"Mehr anzeigen\" etc.).' },
]

const PERSONAL_IMPRESSION_CARDS: CardConfig[] = [
  { key: 'totalImpressions', label: 'Impressions', icon: Eye, format: (v) => v.toLocaleString('de-DE'),
    tooltip: 'Gesamtzahl der Impressionen ueber alle Top Posts.' },
  { key: 'avgEngagementRate', label: 'Durchschn. Engagement Rate', icon: Percent, format: (v) => `${v.toFixed(2)}%`,
    tooltip: 'Engagement geteilt durch Impressions pro Post, dann gemittelt. Beim Privatprofil-Export sind keine Klick-Daten verfuegbar.' },
]

// --- Component ---

function MetricCard({ icon: Icon, label, value, tooltip, iconColor }: {
  icon: LucideIcon
  label: string
  value: string
  tooltip: string
  iconColor: string
}) {
  return (
    <div className="glass-panel p-5 space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-xs font-medium">{label}</span>
        <InfoTooltip text={tooltip} />
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  )
}

export default function MetricsOverview({ metrics, impressionMetrics, exportType }: MetricsOverviewProps) {
  const isPersonal = exportType === 'personal'
  const engagementCards = isPersonal ? PERSONAL_ENGAGEMENT_CARDS : COMPANY_ENGAGEMENT_CARDS
  const impressionCards = isPersonal ? PERSONAL_IMPRESSION_CARDS : IMPRESSION_CARDS

  return (
    <div className="space-y-4">
      {/* Engagement KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {engagementCards.map((card) => (
          <MetricCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={card.format(metrics[card.key as keyof EngagementMetrics])}
            tooltip={card.tooltip}
            iconColor="text-primary"
          />
        ))}
      </div>

      {/* Impression KPIs */}
      {impressionMetrics && (
        <div className={`grid grid-cols-2 ${isPersonal ? '' : 'lg:grid-cols-4'} gap-4`}>
          {impressionCards.map((card) => (
            <MetricCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={card.format(impressionMetrics[card.key as keyof ImpressionMetrics])}
              tooltip={card.tooltip}
              iconColor="text-blue-400"
            />
          ))}
        </div>
      )}
    </div>
  )
}
