import { useCallback } from 'react'
import { useAnalytics } from '../../hooks/useAnalytics'
import DashboardSetup from './DashboardSetup'
import MetricsOverview from './MetricsOverview'
import EngagementChart from './EngagementChart'
import PostFrequencyChart from './PostFrequencyChart'
import TopPostsList from './TopPostsList'
import ImportStatus from './ScrapeStatus'

interface DashboardPageProps {
  onClose: () => void
}

export default function DashboardPage({ onClose }: DashboardPageProps) {
  const {
    companyPage, loading, importing, importError,
    lastRun,
    importFile,
    metrics, impressionMetrics, trends, postFrequency, topPosts, worstPosts,
  } = useAnalytics()

  const handleImport = useCallback(async (file: File) => {
    await importFile(file)
  }, [importFile])

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    )
  }

  // Setup screen if no company page
  if (!companyPage) {
    return (
      <div className="min-h-screen py-12 px-4 transition-colors duration-300">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Analysiere deine Social-Media-Performance.</p>
            </div>
            <button onClick={onClose} className="glass-button h-10 px-4 text-sm font-medium">
              Zurueck
            </button>
          </div>
          <DashboardSetup onImport={handleImport} importing={importing} importError={importError} />
        </div>
      </div>
    )
  }

  // Full dashboard
  return (
    <div className="min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <button onClick={onClose} className="glass-button h-10 px-4 text-sm font-medium">
            Zurueck
          </button>
        </div>

        {/* Import Status */}
        <ImportStatus lastRun={lastRun} importing={importing} onImport={handleImport} />

        {/* KPI Metrics */}
        <MetricsOverview metrics={metrics} impressionMetrics={impressionMetrics} />

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <EngagementChart data={trends} />
          <PostFrequencyChart data={postFrequency} />
        </div>

        {/* Top & Worst Posts */}
        <TopPostsList topPosts={topPosts} worstPosts={worstPosts} />
      </div>
    </div>
  )
}
