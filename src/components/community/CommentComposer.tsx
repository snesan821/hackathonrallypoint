'use client'

import { useState } from 'react'
import { ThreadType } from '@prisma/client'
import { cn } from '@/lib/utils/cn'
import { Send, X } from 'lucide-react'

interface CommentComposerProps {
  civicItemSlug: string
  parentComment?: {
    id: string
    author: string
    body: string
  }
  onSubmit: (body: string, threadType: ThreadType, parentId?: string) => Promise<void>
  onCancel?: () => void
  className?: string
}

export function CommentComposer({
  civicItemSlug,
  parentComment,
  onSubmit,
  onCancel,
  className,
}: CommentComposerProps) {
  const [body, setBody] = useState('')
  const [threadType, setThreadType] = useState<ThreadType>('QUESTION')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const charCount = body.length
  const minChars = 10
  const maxChars = 2000
  const isValid = charCount >= minChars && charCount <= maxChars

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid || isSubmitting) return

    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(body, threadType, parentComment?.id)
      // Reset form on success
      setBody('')
      setThreadType('QUESTION')
    } catch (err: any) {
      setError(err.message || 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const threadTypeOptions: { value: ThreadType; label: string; description: string }[] = [
    {
      value: 'QUESTION',
      label: 'Question',
      description: 'Ask for clarification or more information',
    },
    {
      value: 'SUPPORT',
      label: 'Support',
      description: 'Share why you support this issue',
    },
    {
      value: 'CONCERN',
      label: 'Concern',
      description: 'Raise questions or concerns',
    },
    {
      value: 'EVIDENCE',
      label: 'Evidence',
      description: 'Share relevant data, links, or resources',
    },
  ]

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-4', className)}>
      {/* Reply indicator */}
      {parentComment && (
        <div className="mb-3 flex items-start gap-2 rounded bg-slate-50 p-3">
          <div className="flex-1 text-sm">
            <p className="font-medium text-slate-700">
              Replying to {parentComment.author}
            </p>
            <p className="mt-1 line-clamp-2 text-slate-600">{parentComment.body}</p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600"
              title="Cancel reply"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Civility reminder */}
      <div className="mb-3 rounded bg-blue-50 p-3 text-sm text-blue-900">
        <p className="font-medium">Keep it constructive</p>
        <p className="mt-1 text-blue-800">
          Focus on the issue, not the person. Be respectful of different perspectives.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Thread type selector (only for top-level comments) */}
        {!parentComment && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Comment Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {threadTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setThreadType(option.value)}
                  className={cn(
                    'rounded-lg border-2 p-3 text-left transition-colors',
                    threadType === option.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                  title={option.description}
                >
                  <p className="text-sm font-medium text-slate-900">{option.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text area */}
        <div>
          <label htmlFor="comment-body" className="mb-2 block text-sm font-medium text-slate-700">
            Your Comment
          </label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              parentComment
                ? 'Write your reply...'
                : 'Share your thoughts, questions, or insights...'
            }
            className={cn(
              'w-full resize-none rounded-lg border border-slate-300 p-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20',
              charCount > maxChars && 'border-red-500'
            )}
            rows={4}
            maxLength={maxChars}
          />

          {/* Character counter */}
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={cn(
                charCount < minChars ? 'text-slate-500' : 'text-green-600'
              )}
            >
              {charCount < minChars
                ? `${minChars - charCount} more characters needed`
                : 'Ready to post'}
            </span>
            <span
              className={cn(
                'font-medium',
                charCount > maxChars
                  ? 'text-red-600'
                  : charCount > maxChars * 0.9
                  ? 'text-orange-600'
                  : 'text-slate-500'
              )}
            >
              {charCount} / {maxChars}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
              isValid && !isSubmitting
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'cursor-not-allowed bg-slate-300'
            )}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Posting...' : parentComment ? 'Post Reply' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  )
}
