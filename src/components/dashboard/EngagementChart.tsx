import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { EngagementTrend } from '../../types/analytics'

interface EngagementChartProps {
  data: EngagementTrend[]
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
          <span>{entry.name}: {entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function EngagementChart({ data }: EngagementChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-panel p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Engagement-Verlauf</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Noch keine Daten vorhanden
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Engagement-Verlauf</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorReactions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="reactions"
            name="Reactions"
            stackId="1"
            stroke="hsl(var(--primary))"
            fill="url(#colorReactions)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="comments"
            name="Comments"
            stackId="1"
            stroke="hsl(var(--primary) / 0.7)"
            fill="url(#colorComments)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="shares"
            name="Shares"
            stackId="1"
            stroke="hsl(var(--primary) / 0.4)"
            fill="url(#colorShares)"
            strokeWidth={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
