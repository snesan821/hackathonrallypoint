'use client'

import { useState } from 'react'
import { ThreadType } from '@prisma/client'
import { CommentThread } from './CommentThread'
import { CommentComposer } from './CommentComposer'
import { cn } from '@/lib/utils/cn'
import { MessageCircle, Plus } from 'lucide-react'

interface CommunityDiscussionProps {
  civicItemSlug: string
  initialComments: any[]
  totalCount: number
  onLoadMore?: () => Promise<void>
  onPostComment: (body: string, threadType: ThreadType, parentId?: string) => Promise<void>
  onUpvote?: (commentId: string) => Promise<void>
  onFlag?: (commentId: string) => Promise<void>
  className?: string
}

export function CommunityDiscussion({
  civicItemSlug, initialComments, totalCount, onLoadMore,
  onPostComment, onUpvote, onFlag, className,
}: CommunityDiscussionProps) {
  const [comments, setComments] = useState(initialComments)
  const [selectedThreadType, setSelectedThreadType] = useState<ThreadType | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('newest')
  const [showComposer, setShowComposer] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const handleReply = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId)
    if (comment) {
      setReplyingTo({ id: comment.id, author: comment.author.displayName, body: comment.body })
      setShowComposer(true)
    }
  }

  const handlePostComment = async (body: string, threadType: ThreadType, parentId?: string) => {
    await onPostComment(body, threadType, parentId)
    setShowComposer(false)
    setReplyingTo(null)
  }

  const handleLoadMore = async () => {
    if (onLoadMore && !isLoadingMore) {
      setIsLoadingMore(true)
      try { await onLoadMore() } finally { setIsLoadingMore(false) }
    }
  }

  const filteredComments = selectedThreadType === 'ALL' ? comments : comments.filter((c) => c.threadType === selectedThreadType)
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === 'helpful') return b.upvotes - a.upvotes
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const threadTypeFilters: Array<{ value: ThreadType | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'QUESTION', label: 'Questions' },
    { value: 'SUPPORT', label: 'Support' },
    { value: 'CONCERN', label: 'Concerns' },
    { value: 'EVIDENCE', label: 'Evidence' },
  ]

  return (
    <div id="comments" className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-on-surface-variant" />
          <h3 className="text-xl font-bold text-on-surface font-headline">Discussion ({totalCount})</h3>
        </div>
        <button onClick={() => setShowComposer(!showComposer)} className="btn btn-primary">
          <Plus className="h-4 w-4" /> Add Comment
        </button>
      </div>

      {showComposer && (
        <CommentComposer
          civicItemSlug={civicItemSlug} parentComment={replyingTo}
          onSubmit={handlePostComment}
          onCancel={() => { setShowComposer(false); setReplyingTo(null) }}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Filter:</span>
          <div className="flex gap-1">
            {threadTypeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedThreadType(filter.value)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  selectedThreadType === filter.value
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'helpful')} className="field max-w-[160px]">
            <option value="newest">Newest</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {sortedComments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
          <MessageCircle className="mx-auto mb-3 h-12 w-12 text-on-surface-variant" />
          <p className="text-lg font-medium text-on-surface-variant">No comments yet</p>
          <p className="mt-1 text-sm text-on-surface-variant">Be the first to share your thoughts on this issue</p>
          <button onClick={() => setShowComposer(true)} className="btn btn-primary mt-4">Start the Discussion</button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} onReply={handleReply} onUpvote={onUpvote} onFlag={onFlag} />
          ))}
          {comments.length < totalCount && onLoadMore && (
            <button
              onClick={handleLoadMore} disabled={isLoadingMore}
              className="btn btn-secondary w-full justify-center disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading...' : `Load More Comments (${totalCount - comments.length} remaining)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
