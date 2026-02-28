import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getSupabase } from '../lib/supabase'
import { parseLinkedInExport } from '../utils/linkedinExportParser'
import type {
  CompanyPage, ScrapedPost, ScrapeRun,
  EngagementMetrics, ImpressionMetrics, PostPerformance, EngagementTrend, PostFrequency,
  TimeRange, ExportType, DailyEngagement, DiscoverySummary,
} from '../types/analytics'

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
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [lastRun, setLastRun] = useState<ScrapeRun | null>(null)
  const [dailyData, setDailyData] = useState<DailyEngagement[]>([])
  const [exportType, setExportType] = useState<ExportType>('company')
  const [discoverySummary, setDiscoverySummary] = useState<DiscoverySummary | null>(null)
  const [totalFollowers, setTotalFollowers] = useState<number | null>(null)

  // Load company page + posts + daily data
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
        setDailyData([])
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

      // Load daily analytics data
      let dailyQuery = supabase
        .from('analytics_daily')
        .select('*')
        .eq('company_page_id', page.id)
        .order('date', { ascending: true })

      if (threshold) {
        dailyQuery = dailyQuery.gte('date', threshold.toISOString().split('T')[0])
      }

      const { data: dailyRows } = await dailyQuery
      if (dailyRows && dailyRows.length > 0) {
        setExportType('personal')
        setDailyData(
          (dailyRows as Array<{ date: string; impressions: number; engagements: number }>).map(r => ({
            date: r.date,
            impressions: r.impressions,
            engagements: r.engagements,
          }))
        )
      } else {
        setDailyData([])
      }

      // Load last import run
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

  // Auto-create company page for imports (no URL needed)
  const ensureCompanyPage = useCallback(async (): Promise<CompanyPage | null> => {
    if (!user || !supabase) return null

    if (companyPage) return companyPage

    const insertData: Record<string, unknown> = {
      user_id: user.id,
      platform: 'linkedin',
      page_url: 'linkedin-import',
      page_name: 'LinkedIn Analytics Import',
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
      console.error('Failed to create company page:', error)
      return null
    }

    const page = data as CompanyPage
    setCompanyPage(page)
    return page
  }, [user, supabase, companyPage])

  // Import file
  const importFile = useCallback(async (file: File) => {
    if (!user || !supabase) return

    setImporting(true)
    setImportError(null)

    try {
      // 1. Parse file
      const buffer = await file.arrayBuffer()
      const result = parseLinkedInExport(buffer)

      if (result.errors.length > 0) {
        setImportError(result.errors.join('\n'))
        return
      }

      if (result.posts.length === 0) {
        setImportError('Keine Posts in der Datei gefunden.')
        return
      }

      // 2. Ensure company page exists
      const page = await ensureCompanyPage()
      if (!page) {
        setImportError('Company Page konnte nicht erstellt werden.')
        return
      }

      // 3. Upsert posts
      let postsNew = 0
      let postsUpdated = 0

      const isPersonal = result.exportType === 'personal'

      for (const parsed of result.posts) {
        // For personal exports, use engagementTotal override; for company, sum the breakdown
        const engagementTotal = isPersonal && parsed.engagementTotal !== undefined
          ? parsed.engagementTotal
          : parsed.reactions + parsed.comments + parsed.shares

        const engagementRate = parsed.impressions > 0
          ? Math.round((engagementTotal / parsed.impressions) * 10000) / 100
          : 0

        const postData = {
          company_page_id: page.id,
          user_id: user.id,
          platform: 'linkedin',
          external_id: parsed.postUrl,
          content: parsed.content,
          post_url: parsed.postUrl,
          posted_at: parsed.postedAt,
          reactions_count: parsed.reactions,
          comments_count: parsed.comments,
          shares_count: parsed.shares,
          engagement_total: engagementTotal,
          media_type: parsed.mediaType,
          impressions: parsed.impressions,
          clicks: parsed.clicks,
          ctr: parsed.ctr,
          engagement_rate: engagementRate,
          video_views: parsed.videoViews,
          source_type: 'import',
          updated_at: new Date().toISOString(),
        }

        // Try insert first, if conflict update
        const { data: existing } = await supabase
          .from('scraped_posts')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_url', parsed.postUrl)
          .limit(1)

        const existingRow = (existing as { id: string }[] | null)?.[0]

        if (existingRow) {
          await supabase
            .from('scraped_posts')
            .update(postData as never)
            .eq('id', existingRow.id)
          postsUpdated++
        } else {
          await supabase
            .from('scraped_posts')
            .insert(postData as never)
          postsNew++
        }
      }

      // 4. For personal exports: upsert daily analytics data
      if (isPersonal) {
        setExportType('personal')

        // Store discovery summary and total followers in state
        if (result.discoverySummary) {
          setDiscoverySummary(result.discoverySummary)
        }
        if (result.totalFollowers !== undefined) {
          setTotalFollowers(result.totalFollowers)
        }

        // Merge engagement + follower data by date
        const dailyMap = new Map<string, { impressions: number; engagements: number; newFollowers: number }>()

        if (result.dailyEngagement) {
          for (const d of result.dailyEngagement) {
            dailyMap.set(d.date, {
              impressions: d.impressions,
              engagements: d.engagements,
              newFollowers: 0,
            })
          }
        }

        if (result.followerData) {
          for (const f of result.followerData) {
            const existing = dailyMap.get(f.date)
            if (existing) {
              existing.newFollowers = f.newFollowers
            } else {
              dailyMap.set(f.date, {
                impressions: 0,
                engagements: 0,
                newFollowers: f.newFollowers,
              })
            }
          }
        }

        // Upsert into analytics_daily
        if (dailyMap.size > 0) {
          const dailyRows = Array.from(dailyMap.entries()).map(([date, data]) => ({
            user_id: user.id,
            company_page_id: page.id,
            date,
            impressions: data.impressions,
            engagements: data.engagements,
            new_followers: data.newFollowers,
          }))

          // Batch upsert in chunks of 100
          for (let i = 0; i < dailyRows.length; i += 100) {
            const chunk = dailyRows.slice(i, i + 100)
            await supabase
              .from('analytics_daily')
              .upsert(chunk as never[], { onConflict: 'company_page_id,date' })
          }
        }
      } else {
        setExportType('company')
      }

      // 5. Log import run
      const runData = {
        company_page_id: page.id,
        user_id: user.id,
        status: 'success',
        posts_found: result.posts.length,
        posts_new: postsNew,
        posts_updated: postsUpdated,
        run_type: 'import',
        file_name: file.name,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      }

      await supabase.from('scrape_runs').insert(runData as never)

      // 6. Reload data
      await loadData()
    } catch (err) {
      console.error('Import failed:', err)
      setImportError(err instanceof Error ? err.message : 'Import fehlgeschlagen')
    } finally {
      setImporting(false)
    }
  }, [user, supabase, ensureCompanyPage, loadData])

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

    // For personal exports, use engagement_total directly (no breakdown available)
    const isPersonalExport = exportType === 'personal'
    const totalEngagement = isPersonalExport
      ? posts.reduce((sum, p) => sum + p.engagement_total, 0)
      : totalReactions + totalComments + totalShares
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
  }, [posts, exportType])

  // Impression metrics (only meaningful if data exists)
  const impressionMetrics: ImpressionMetrics | null = useMemo(() => {
    const postsWithImpressions = posts.filter(p => p.impressions > 0)
    if (postsWithImpressions.length === 0) return null

    const totalImpressions = postsWithImpressions.reduce((sum, p) => sum + p.impressions, 0)
    const totalClicks = postsWithImpressions.reduce((sum, p) => sum + p.clicks, 0)
    const avgCTR = totalImpressions > 0
      ? Math.round((totalClicks / totalImpressions) * 10000) / 100
      : 0
    const avgEngagementRate = postsWithImpressions.reduce((sum, p) => sum + p.engagement_rate, 0) / postsWithImpressions.length

    return {
      totalImpressions,
      totalClicks,
      avgCTR,
      avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
    }
  }, [posts])

  // Engagement trends grouped by day
  const trends: EngagementTrend[] = useMemo(() => {
    // If we have daily analytics data (personal export), use it directly
    if (dailyData.length > 0) {
      return dailyData.map(d => ({
        date: d.date,
        reactions: 0,
        comments: 0,
        shares: 0,
        total: d.engagements,
        postCount: 0,
        impressions: d.impressions,
      }))
    }

    // Fallback: aggregate from posts (company export)
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
  }, [posts, dailyData])

  // Post frequency grouped by week
  const postFrequency: PostFrequency[] = useMemo(() => {
    if (posts.length === 0) return []

    const byWeek = new Map<string, number>()

    for (const post of posts) {
      if (!post.posted_at) continue
      const d = new Date(post.posted_at)
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
    importing,
    importError,
    timeRange,
    setTimeRange,
    lastRun,
    exportType,
    discoverySummary,
    totalFollowers,

    // Methods
    importFile,
    refreshData,

    // Computed
    metrics,
    impressionMetrics,
    trends,
    postFrequency,
    topPosts,
    worstPosts,
  }
}
