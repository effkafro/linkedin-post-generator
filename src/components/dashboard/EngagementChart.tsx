import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { EngagementTrend, ExportType } from '../../types/analytics'

interface EngagementChartProps {
  data: EngagementTrend[]
  exportType: ExportType
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

function CustomTooltip({ active, payload, label }: { active?: boolean, payload?: Array<{ name: string, value: number, color: string }>, label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel-elevated p-3 text-sm space-y-1">
      <p className="font-medium text-foreground">{label ? formatDate(label) : ''}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-muted-foreground">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}: {entry.value.toLocaleString('de-DE')}</span>
        </div>
      ))}
    </div>
  )
}

export default function EngagementChart({ data, exportType }: EngagementChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Engagement-Verlauf</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Noch keine Daten vorhanden
        </div>
      </div>
    )
  }

  const isPersonal = exportType === 'personal'

  // Read CSS variables at render time for Recharts (SVG doesn't support Tailwind classes)
  const style = getComputedStyle(document.documentElement)
  const primaryColor = style.getPropertyValue('--primary').trim()
  const mutedFg = style.getPropertyValue('--muted-foreground').trim()

  return (
    <div className="glass-panel p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">Engagement-Verlauf</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorEngagements" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorReactions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: mutedFg }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: mutedFg }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {isPersonal ? (
            <>
              <Area
                type="monotone"
                dataKey="total"
                name="Engagements"
                stroke={primaryColor}
                fill="url(#colorEngagements)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="impressions"
                name="Impressions"
                stroke="#60a5fa"
                fill="url(#colorImpressions)"
                strokeWidth={1.5}
              />
            </>
          ) : (
            <>
              <Area
                type="monotone"
                dataKey="reactions"
                name="Reactions"
                stackId="1"
                stroke={primaryColor}
                fill="url(#colorReactions)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="comments"
                name="Comments"
                stackId="1"
                stroke={primaryColor}
                fill="url(#colorComments)"
                strokeWidth={1.5}
                strokeOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="shares"
                name="Shares"
                stackId="1"
                stroke={primaryColor}
                fill="url(#colorShares)"
                strokeWidth={1}
                strokeOpacity={0.4}
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
