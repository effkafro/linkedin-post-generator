import { useCallback } from 'react'
import { useAnalytics } from '../../hooks/useAnalytics'
import DashboardSetup from './DashboardSetup'
import TimeRangeSelector from './TimeRangeSelector'
import MetricsOverview from './MetricsOverview'
import EngagementChart from './EngagementChart'
import PostFrequencyChart from './PostFrequencyChart'
import TopPostsList from './TopPostsList'
import ScrapeStatus from './ScrapeStatus'

interface DashboardPageProps {
  onClose: () => void
}

export default function DashboardPage({ onClose }: DashboardPageProps) {
  const {
    companyPage, loading, scraping,
    timeRange, setTimeRange, lastRun,
    saveCompanyPage, triggerScrape,
    metrics, trends, postFrequency, topPosts, worstPosts,
  } = useAnalytics()

  const handleConnect = useCallback(async (url: string) => {
    const page = await saveCompanyPage(url)
    if (page) {
      await triggerScrape(page.id)
    }
  }, [saveCompanyPage, triggerScrape])

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
          <DashboardSetup onConnect={handleConnect} loading={scraping} />
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
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {companyPage.page_name || companyPage.page_url}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            <button onClick={onClose} className="glass-button h-10 px-4 text-sm font-medium">
              Zurueck
            </button>
          </div>
        </div>

        {/* Scrape Status */}
        <ScrapeStatus lastRun={lastRun} scraping={scraping} onScrape={() => triggerScrape()} />

        {/* KPI Metrics */}
        <MetricsOverview metrics={metrics} />

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
