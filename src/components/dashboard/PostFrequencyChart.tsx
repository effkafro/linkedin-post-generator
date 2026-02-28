import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { PostFrequency } from '../../types/analytics'

interface PostFrequencyChartProps {
  data: PostFrequency[]
}

function formatWeek(dateStr: string) {
  const d = new Date(dateStr)
  return `KW ${getISOWeek(d)}`
}

function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

function CustomTooltip({ active, payload, label }: { active?: boolean, payload?: Array<{ value: number }>, label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel-elevated p-3 text-sm space-y-1">
      <p className="font-medium text-foreground">{label ? formatWeek(label) : ''}</p>
      <p className="text-muted-foreground">{payload[0].value} Posts</p>
    </div>
  )
}

export default function PostFrequencyChart({ data }: PostFrequencyChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-panel p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Post-Frequenz</h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Noch keine Daten vorhanden
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">Post-Frequenz</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="week"
            tickFormatter={formatWeek}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="postCount"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
