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

export function CommentThread({
  comment,
  onReply,
  onUpvote,
  onFlag,
  className,
}: CommentThreadProps) {
  const [showAllReplies, setShowAllReplies] = useState(false)
  const visibleReplies = showAllReplies ? comment.replies : comment.replies.slice(0, 2)
  const hiddenReplyCount = comment.replies.length - visibleReplies.length

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main comment */}
      <CommentCard
        id={comment.id}
        body={comment.body}
        author={comment.author}
        threadType={comment.threadType}
        upvotes={comment.upvotes}
        status={comment.status}
        createdAt={comment.createdAt}
        onReply={onReply}
        onUpvote={onUpvote}
        onFlag={onFlag}
        isReply={false}
      />

      {/* Replies */}
      {visibleReplies.length > 0 && (
        <div className="ml-8 space-y-3 border-l-2 border-slate-200 pl-4">
          {visibleReplies.map((reply) => (
            <CommentCard
              key={reply.id}
              id={reply.id}
              body={reply.body}
              author={reply.author}
              upvotes={reply.upvotes}
              status={reply.status}
              createdAt={reply.createdAt}
              onUpvote={onUpvote}
              onFlag={onFlag}
              isReply
            />
          ))}

          {/* Show more replies button */}
          {hiddenReplyCount > 0 && (
            <button
              onClick={() => setShowAllReplies(true)}
              className="text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Show {hiddenReplyCount} more {hiddenReplyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Individual comment card
 */
interface CommentCardProps {
  id: string
  body: string
  author: CommentAuthor
  threadType?: ThreadType
  upvotes: number
  status: CommentStatus
  createdAt: Date
  onReply?: (commentId: string) => void
  onUpvote?: (commentId: string) => void
  onFlag?: (commentId: string) => void
  isReply?: boolean
}

function CommentCard({
  id,
  body,
  author,
  threadType,
  upvotes,
  status,
  createdAt,
  onReply,
  onUpvote,
  onFlag,
  isReply = false,
}: CommentCardProps) {
  const [hasUpvoted, setHasUpvoted] = useState(false)

  const handleUpvote = async () => {
    if (onUpvote) {
      setHasUpvoted(!hasUpvoted)
      try {
        await onUpvote(id)
      } catch (error) {
        setHasUpvoted(hasUpvoted)
      }
    }
  }

  // Thread type badge colors
  const threadTypeBadge = threadType
    ? {
        QUESTION: { color: 'bg-blue-100 text-blue-700', label: 'Question' },
        SUPPORT: { color: 'bg-green-100 text-green-700', label: 'Support' },
        CONCERN: { color: 'bg-yellow-100 text-yellow-700', label: 'Concern' },
        EVIDENCE: { color: 'bg-purple-100 text-purple-700', label: 'Evidence' },
      }[threadType]
    : null

  // Handle flagged/hidden comments
  if (status === 'FLAGGED' || status === 'HIDDEN') {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-slate-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            {status === 'FLAGGED'
              ? 'This comment is under review.'
              : 'This comment has been hidden.'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      {/* Author info */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-600">
                {author.displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{author.displayName}</span>

              {/* Role badge */}
              {(author.role === 'ORGANIZER' ||
                author.role === 'MODERATOR' ||
                author.role === 'ADMIN') && (
                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                  {author.role}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Thread type badge */}
        {threadTypeBadge && !isReply && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              threadTypeBadge.color
            )}
          >
            {threadTypeBadge.label}
          </span>
        )}
      </div>

      {/* Comment body */}
      <div className="mb-3 text-sm leading-relaxed text-slate-700">{body}</div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-sm">
        {/* Upvote */}
        <button
          onClick={handleUpvote}
          className={cn(
            'flex items-center gap-1 transition-colors',
            hasUpvoted ? 'text-orange-600' : 'text-slate-500 hover:text-orange-600'
          )}
        >
          <ThumbsUp className={cn('h-4 w-4', hasUpvoted && 'fill-current')} />
          <span>{upvotes + (hasUpvoted ? 1 : 0)}</span>
        </button>

        {/* Reply */}
        {!isReply && onReply && (
          <button
            onClick={() => onReply(id)}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Reply</span>
          </button>
        )}

        {/* Flag */}
        <button
          onClick={() => onFlag?.(id)}
          className="ml-auto flex items-center gap-1 text-slate-400 hover:text-red-600"
        >
          <Flag className="h-4 w-4" />
          <span>Flag</span>
        </button>
      </div>
    </div>
  )
}
