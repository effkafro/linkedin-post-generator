import { Heart, MessageCircle, Share2, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import type { PostPerformance } from '../../types/analytics'

interface TopPostsListProps {
  topPosts: PostPerformance[]
  worstPosts: PostPerformance[]
}

function PostCard({ item }: { item: PostPerformance }) {
  const { post, isOutlier } = item

  return (
    <div
      className={`glass-panel p-4 space-y-3 transition-all hover:border-white/10 ${
        post.post_url ? 'cursor-pointer' : ''
      }`}
      onClick={() => post.post_url && window.open(post.post_url, '_blank', 'noopener')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-foreground line-clamp-3 flex-1">
          {post.content || 'Kein Textinhalt'}
        </p>
        {post.post_url && (
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {post.posted_at && (
          <span>
            {new Date(post.posted_at).toLocaleDateString('de-DE', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            })}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" /> {post.reactions_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" /> {post.comments_count}
        </span>
        <span className="flex items-center gap-1">
          <Share2 className="w-3 h-3" /> {post.shares_count}
        </span>
        {isOutlier === 'top' && (
          <span className="text-green-400 font-semibold ml-auto">Outlier</span>
        )}
      </div>
    </div>
  )
}

export default function TopPostsList({ topPosts, worstPosts }: TopPostsListProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Top Performers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <h3 className="text-base font-semibold text-foreground">Top Performer</h3>
        </div>
        <div className="space-y-3">
          {topPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Daten</p>
          ) : (
            topPosts.map((item) => <PostCard key={item.post.id} item={item} />)
          )}
        </div>
      </div>

      {/* Worst Performers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-orange-400" />
          <h3 className="text-base font-semibold text-foreground">Verbesserungspotenzial</h3>
        </div>
        <div className="space-y-3">
          {worstPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Daten</p>
          ) : (
            worstPosts.map((item) => <PostCard key={item.post.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  )
}
