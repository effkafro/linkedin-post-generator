import { useState } from 'react'
import type { ExamplePost } from '../../types/profile'

interface ExamplePostsProps {
  posts: ExamplePost[]
  onAdd: (content: string, performanceNotes?: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export default function ExamplePosts({ posts, onAdd, onRemove }: ExamplePostsProps) {
  const [newContent, setNewContent] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!newContent.trim()) return
    setAdding(true)
    await onAdd(newContent.trim(), newNotes.trim() || undefined)
    setNewContent('')
    setNewNotes('')
    setAdding(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Beispiel-Posts</h3>
        <span className="text-xs text-muted-foreground">{posts.length} Posts</span>
      </div>

      <p className="text-sm text-muted-foreground">
        Füge deine besten LinkedIn-Posts hinzu, damit die KI deinen Stil lernen kann.
      </p>

      {/* Add new post */}
      <div className="space-y-3 p-4 rounded-2xl bg-secondary/20 border border-white/5">
        <textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="Füge hier einen deiner besten LinkedIn-Posts ein..."
          rows={4}
          disabled={adding}
          className="flex w-full rounded-xl glass-input px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-all disabled:opacity-50"
        />
        <input
          type="text"
          value={newNotes}
          onChange={e => setNewNotes(e.target.value)}
          placeholder="Performance-Notizen (optional, z.B. '500 Likes, 50 Kommentare')"
          disabled={adding}
          className="flex w-full h-10 rounded-xl glass-input px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all disabled:opacity-50"
        />
        <button
          onClick={handleAdd}
          disabled={!newContent.trim() || adding}
          className="glass-button h-10 px-6 text-sm font-medium hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {adding ? 'Wird gespeichert...' : 'Post hinzufügen'}
        </button>
      </div>

      {/* Existing posts */}
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="group relative p-4 rounded-2xl glass-input">
            <p className="text-sm text-foreground/90 line-clamp-4 whitespace-pre-wrap">
              {post.content}
            </p>
            {post.performance_notes && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {post.performance_notes}
              </p>
            )}
            <button
              onClick={() => onRemove(post.id)}
              className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
