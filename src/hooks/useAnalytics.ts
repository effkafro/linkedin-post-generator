import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getSupabase } from '../lib/supabase'
import type {
  CompanyPage, ScrapedPost, ScrapeRun,
  EngagementMetrics, PostPerformance, EngagementTrend, PostFrequency,
  TimeRange,
} from '../types/analytics'

const ANALYTICS_WEBHOOK_URL = import.meta.env.VITE_ANALYTICS_WEBHOOK_URL

function getDateThreshold(range: TimeRange): Date | null {
  if (range === 'all') return null
  const now = new Date()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  now.setDate(now.getDate() - days)
  return now
}

export function useAnalytics() {
  const { user } = useAuth()
  const supabase = getSupabase()

  const [companyPage, setCompanyPage] = useState<CompanyPage | null>(null)
  const [posts, setPosts] = useState<ScrapedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [lastRun, setLastRun] = useState<ScrapeRun | null>(null)

  // Load company page + posts
  const loadData = useCallback(async () => {
    if (!user || !supabase) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Load company page
      const { data: pages } = await supabase
        .from('company_pages')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)

      const page = pages?.[0] as CompanyPage | undefined
      setCompanyPage(page ?? null)

      if (!page) {
        setPosts([])
        setLastRun(null)
        setLoading(false)
        return
      }

      // Load posts with time filter
      let postsQuery = supabase
        .from('scraped_posts')
        .select('*')
        .eq('company_page_id', page.id)
        .order('posted_at', { ascending: false })

      const threshold = getDateThreshold(timeRange)
      if (threshold) {
        postsQuery = postsQuery.gte('posted_at', threshold.toISOString())
      }

      const { data: postsData } = await postsQuery
      setPosts((postsData as ScrapedPost[] | null) ?? [])

      // Load last scrape run
      const { data: runs } = await supabase
        .from('scrape_runs')
        .select('*')
        .eq('company_page_id', page.id)
        .order('started_at', { ascending: false })
        .limit(1)

      setLastRun((runs?.[0] as ScrapeRun | undefined) ?? null)
    } catch (err) {
      console.error('Failed to load analytics data:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase, timeRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Save company page
  const saveCompanyPage = useCallback(async (url: string): Promise<CompanyPage | null> => {
    if (!user || !supabase) return null

    const insertData: Record<string, unknown> = {
      user_id: user.id,
      platform: 'linkedin',
      page_url: url.trim(),
    }

    const { data, error } = await supabase
      .from('company_pages')
      .upsert(
        insertData as never,
        { onConflict: 'user_id,platform,page_url' }
      )
      .select()
      .single()

    if (error) {
      console.error('Failed to save company page:', error)
      return null
    }

    const page = data as CompanyPage
    setCompanyPage(page)
    return page
  }, [user, supabase])

  // Trigger scrape via n8n webhook
  const triggerScrape = useCallback(async (pageId?: string) => {
    if (!user || !ANALYTICS_WEBHOOK_URL) return

    const targetPageId = pageId ?? companyPage?.id
    if (!targetPageId) return

    setScraping(true)
    try {
      const response = await fetch(ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          company_page_id: targetPageId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Scrape failed: ${response.statusText}`)
      }

      // Reload data after scrape
      await loadData()
    } catch (err) {
      console.error('Scrape trigger failed:', err)
    } finally {
      setScraping(false)
    }
  }, [user, companyPage, loadData])

  // Refresh data from Supabase
  const refreshData = useCallback(() => {
    return loadData()
  }, [loadData])

  // --- Computed Metrics ---

  const metrics: EngagementMetrics = useMemo(() => {
    if (posts.length === 0) {
      return {
        totalReactions: 0, totalComments: 0, totalShares: 0,
        totalEngagement: 0, avgPerPost: 0, totalPosts: 0, topPostEngagement: 0,
      }
    }

    const totalReactions = posts.reduce((sum, p) => sum + p.reactions_count, 0)
    const totalComments = posts.reduce((sum, p) => sum + p.comments_count, 0)
    const totalShares = posts.reduce((sum, p) => sum + p.shares_count, 0)
    const totalEngagement = totalReactions + totalComments + totalShares
    const topPostEngagement = Math.max(...posts.map(p => p.engagement_total))

    return {
      totalReactions,
      totalComments,
      totalShares,
      totalEngagement,
      avgPerPost: Math.round(totalEngagement / posts.length),
      totalPosts: posts.length,
      topPostEngagement,
    }
  }, [posts])

  // Engagement trends grouped by day
  const trends: EngagementTrend[] = useMemo(() => {
    if (posts.length === 0) return []

    const byDay = new Map<string, EngagementTrend>()

    for (const post of posts) {
      if (!post.posted_at) continue
      const date = post.posted_at.split('T')[0]
      const existing = byDay.get(date)

      if (existing) {
        existing.reactions += post.reactions_count
        existing.comments += post.comments_count
        existing.shares += post.shares_count
        existing.total += post.engagement_total
        existing.postCount += 1
      } else {
        byDay.set(date, {
          date,
          reactions: post.reactions_count,
          comments: post.comments_count,
          shares: post.shares_count,
          total: post.engagement_total,
          postCount: 1,
        })
      }
    }

    return Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [posts])

  // Post frequency grouped by week
  const postFrequency: PostFrequency[] = useMemo(() => {
    if (posts.length === 0) return []

    const byWeek = new Map<string, number>()

    for (const post of posts) {
      if (!post.posted_at) continue
      const d = new Date(post.posted_at)
      // Get Monday of the week
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(d)
      monday.setDate(diff)
      const week = monday.toISOString().split('T')[0]
      byWeek.set(week, (byWeek.get(week) ?? 0) + 1)
    }

    return Array.from(byWeek.entries())
      .map(([week, postCount]) => ({ week, postCount }))
      .sort((a, b) => a.week.localeCompare(b.week))
  }, [posts])

  // Outlier detection: mean +/- 2*stddev
  const { topPosts, worstPosts } = useMemo((): { topPosts: PostPerformance[], worstPosts: PostPerformance[] } => {
    if (posts.length < 3) {
      return {
        topPosts: posts.map(p => ({ post: p, engagementRate: p.engagement_total, isOutlier: null })),
        worstPosts: [],
      }
    }

    const engagements = posts.map(p => p.engagement_total)
    const mean = engagements.reduce((a, b) => a + b, 0) / engagements.length
    const variance = engagements.reduce((sum, val) => sum + (val - mean) ** 2, 0) / engagements.length
    const stddev = Math.sqrt(variance)

    const topThreshold = mean + 2 * stddev
    const bottomThreshold = mean - 2 * stddev

    const withPerformance: PostPerformance[] = posts.map(p => ({
      post: p,
      engagementRate: p.engagement_total,
      isOutlier: p.engagement_total >= topThreshold ? 'top'
        : p.engagement_total <= bottomThreshold ? 'bottom'
        : null,
    }))

    const sorted = [...withPerformance].sort((a, b) => b.engagementRate - a.engagementRate)

    return {
      topPosts: sorted.slice(0, 5),
      worstPosts: sorted.slice(-5).reverse(),
    }
  }, [posts])

  return {
    // State
    companyPage,
    posts,
    loading,
    scraping,
    timeRange,
    setTimeRange,
    lastRun,

    // Methods
    saveCompanyPage,
    triggerScrape,
    refreshData,

    // Computed
    metrics,
    trends,
    postFrequency,
    topPosts,
    worstPosts,
  }
}
