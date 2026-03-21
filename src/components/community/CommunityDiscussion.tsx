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
  civicItemSlug,
  initialComments,
  totalCount,
  onLoadMore,
  onPostComment,
  onUpvote,
  onFlag,
  className,
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
      setReplyingTo({
        id: comment.id,
        author: comment.author.displayName,
        body: comment.body,
      })
      setShowComposer(true)
    }
  }

  const handlePostComment = async (
    body: string,
    threadType: ThreadType,
    parentId?: string
  ) => {
    await onPostComment(body, threadType, parentId)
    setShowComposer(false)
    setReplyingTo(null)
    // Refresh comments list (in a real app, you'd update the state optimistically)
  }

  const handleLoadMore = async () => {
    if (onLoadMore && !isLoadingMore) {
      setIsLoadingMore(true)
      try {
        await onLoadMore()
      } finally {
        setIsLoadingMore(false)
      }
    }
  }

  // Filter comments by thread type
  const filteredComments =
    selectedThreadType === 'ALL'
      ? comments
      : comments.filter((c) => c.threadType === selectedThreadType)

  // Sort comments
  const sortedComments = [...filteredComments].sort((a, b) => {
    if (sortBy === 'helpful') {
      return b.upvotes - a.upvotes
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-slate-700" />
          <h3 className="text-xl font-bold text-slate-900">
            Discussion ({totalCount})
          </h3>
        </div>

        <button
          onClick={() => setShowComposer(!showComposer)}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" />
          Add Comment
        </button>
      </div>

      {/* Composer */}
      {showComposer && (
        <CommentComposer
          civicItemSlug={civicItemSlug}
          parentComment={replyingTo}
          onSubmit={handlePostComment}
          onCancel={() => {
            setShowComposer(false)
            setReplyingTo(null)
          }}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Thread type filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Filter:</span>
          <div className="flex gap-1">
            {threadTypeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedThreadType(filter.value)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  selectedThreadType === filter.value
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'helpful')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="newest">Newest</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Comments list */}
      {sortedComments.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <MessageCircle className="mx-auto mb-3 h-12 w-12 text-slate-400" />
          <p className="text-lg font-medium text-slate-600">No comments yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Be the first to share your thoughts on this issue
          </p>
          <button
            onClick={() => setShowComposer(true)}
            className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Start the Discussion
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onUpvote={onUpvote}
              onFlag={onFlag}
            />
          ))}

          {/* Load more button */}
          {comments.length < totalCount && onLoadMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="w-full rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading...' : `Load More Comments (${totalCount - comments.length} remaining)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
