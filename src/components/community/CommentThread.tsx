'use client'

import { useState } from 'react'
import { ThreadType, CommentStatus, UserRole } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils/cn'
import { ThumbsUp, Flag, MessageCircle, AlertCircle } from 'lucide-react'

interface CommentAuthor {
  id: string
  displayName: string
  avatarUrl: string | null
  role: UserRole
}

interface Reply {
  id: string
  body: string
  author: CommentAuthor
  upvotes: number
  status: CommentStatus
  createdAt: Date
  updatedAt: Date
}

interface Comment {
  id: string
  body: string
  threadType: ThreadType
  author: CommentAuthor
  upvotes: number
  status: CommentStatus
  createdAt: Date
  updatedAt: Date
  replyCount: number
  replies: Reply[]
}

interface CommentThreadProps {
  comment: Comment
  onReply?: (commentId: string) => void
  onUpvote?: (commentId: string) => void
  onFlag?: (commentId: string) => void
  className?: string
}

export function CommentThread({ comment, onReply, onUpvote, onFlag, className }: CommentThreadProps) {
  const [showAllReplies, setShowAllReplies] = useState(false)
  const visibleReplies = showAllReplies ? comment.replies : comment.replies.slice(0, 2)
  const hiddenReplyCount = comment.replies.length - visibleReplies.length

  return (
    <div className={cn('space-y-3', className)}>
      <CommentCard
        id={comment.id} body={comment.body} author={comment.author}
        threadType={comment.threadType} upvotes={comment.upvotes}
        status={comment.status} createdAt={comment.createdAt}
        onReply={onReply} onUpvote={onUpvote} onFlag={onFlag} isReply={false}
      />
      {visibleReplies.length > 0 && (
        <div className="ml-8 space-y-3 border-l-2 border-outline-variant/30 pl-4">
          {visibleReplies.map((reply) => (
            <CommentCard
              key={reply.id} id={reply.id} body={reply.body} author={reply.author}
              upvotes={reply.upvotes} status={reply.status} createdAt={reply.createdAt}
              onUpvote={onUpvote} onFlag={onFlag} isReply
            />
          ))}
          {hiddenReplyCount > 0 && (
            <button onClick={() => setShowAllReplies(true)} className="text-sm font-medium text-primary hover:text-primary-container">
              Show {hiddenReplyCount} more {hiddenReplyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface CommentCardProps {
  id: string; body: string; author: CommentAuthor; threadType?: ThreadType
  upvotes: number; status: CommentStatus; createdAt: Date
  onReply?: (commentId: string) => void; onUpvote?: (commentId: string) => void
  onFlag?: (commentId: string) => void; isReply?: boolean
}

function CommentCard({ id, body, author, threadType, upvotes, status, createdAt, onReply, onUpvote, onFlag, isReply = false }: CommentCardProps) {
  const [hasUpvoted, setHasUpvoted] = useState(false)

  const handleUpvote = async () => {
    if (onUpvote) {
      setHasUpvoted(!hasUpvoted)
      try { await onUpvote(id) } catch { setHasUpvoted(hasUpvoted) }
    }
  }

  const threadTypeBadge = threadType ? {
    QUESTION: { color: 'bg-blue-100 text-blue-700', label: 'Question' },
    SUPPORT: { color: 'bg-[var(--co-success)]/10 text-[var(--co-success)]', label: 'Support' },
    CONCERN: { color: 'bg-[var(--co-warning)]/10 text-[var(--co-warning)]', label: 'Concern' },
    EVIDENCE: { color: 'bg-purple-100 text-purple-700', label: 'Evidence' },
  }[threadType] : null

  if (status === 'FLAGGED' || status === 'HIDDEN') {
    return (
      <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            {status === 'FLAGGED' ? 'This comment is under review.' : 'This comment has been hidden.'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-surface-container-high">
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt={author.displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-on-surface-variant">
                {author.displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-on-surface">{author.displayName}</span>
              {(author.role === 'ORGANIZER' || author.role === 'MODERATOR' || author.role === 'ADMIN') && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">{author.role}</span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</p>
          </div>
        </div>
        {threadTypeBadge && !isReply && (
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', threadTypeBadge.color)}>{threadTypeBadge.label}</span>
        )}
      </div>

      <div className="mb-3 text-sm leading-relaxed text-on-surface-variant">{body}</div>

      <div className="flex items-center gap-4 text-sm">
        <button onClick={handleUpvote} className={cn('flex items-center gap-1 transition-colors', hasUpvoted ? 'text-primary' : 'text-on-surface-variant hover:text-primary')}>
          <ThumbsUp className={cn('h-4 w-4', hasUpvoted && 'fill-current')} />
          <span>{upvotes + (hasUpvoted ? 1 : 0)}</span>
        </button>
        {!isReply && onReply && (
          <button onClick={() => onReply(id)} className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface">
            <MessageCircle className="h-4 w-4" /><span>Reply</span>
          </button>
        )}
        <button onClick={() => onFlag?.(id)} className="ml-auto flex items-center gap-1 text-on-surface-variant hover:text-[var(--co-error)]">
          <Flag className="h-4 w-4" /><span>Flag</span>
        </button>
      </div>
    </div>
  )
}
