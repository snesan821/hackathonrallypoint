'use client'

import { useState } from 'react'
import { ThreadType } from '@prisma/client'
import { cn } from '@/lib/utils/cn'
import { Send, X } from 'lucide-react'

interface CommentComposerProps {
  civicItemSlug: string
  parentComment?: { id: string; author: string; body: string }
  onSubmit: (body: string, threadType: ThreadType, parentId?: string) => Promise<void>
  onCancel?: () => void
  className?: string
}

export function CommentComposer({ civicItemSlug, parentComment, onSubmit, onCancel, className }: CommentComposerProps) {
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
      setBody('')
      setThreadType('QUESTION')
    } catch (err: any) {
      setError(err.message || 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const threadTypeOptions: { value: ThreadType; label: string; description: string }[] = [
    { value: 'QUESTION', label: 'Question', description: 'Ask for clarification or more information' },
    { value: 'SUPPORT', label: 'Support', description: 'Share why you support this issue' },
    { value: 'CONCERN', label: 'Concern', description: 'Raise questions or concerns' },
    { value: 'EVIDENCE', label: 'Evidence', description: 'Share relevant data, links, or resources' },
  ]

  return (
    <div className={cn('rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4', className)}>
      {parentComment && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-surface-container-low p-3">
          <div className="flex-1 text-sm">
            <p className="font-medium text-on-surface-variant">Replying to {parentComment.author}</p>
            <p className="mt-1 line-clamp-2 text-on-surface-variant">{parentComment.body}</p>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="text-on-surface-variant hover:text-on-surface" title="Cancel reply">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="mb-3 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant">
        <p className="font-medium text-on-surface">Keep it constructive</p>
        <p className="mt-1">Focus on the issue, not the person. Be respectful of different perspectives.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {!parentComment && (
          <div>
            <label className="mb-2 block text-sm font-medium text-on-surface-variant">Comment Type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {threadTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setThreadType(option.value)}
                  className={cn(
                    'rounded-xl border-2 p-3 text-left transition-colors',
                    threadType === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline'
                  )}
                  title={option.description}
                >
                  <p className="text-sm font-medium text-on-surface">{option.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="comment-body" className="mb-2 block text-sm font-medium text-on-surface-variant">Your Comment</label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={parentComment ? 'Write your reply...' : 'Share your thoughts, questions, or insights...'}
            className={cn('field resize-none', charCount > maxChars && 'border-[var(--co-error)]')}
            rows={4}
            maxLength={maxChars}
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className={cn(charCount < minChars ? 'text-on-surface-variant' : 'text-[var(--co-success)]')}>
              {charCount < minChars ? `${minChars - charCount} more characters needed` : 'Ready to post'}
            </span>
            <span className={cn('font-medium', charCount > maxChars ? 'text-[var(--co-error)]' : charCount > maxChars * 0.9 ? 'text-[var(--co-warning)]' : 'text-on-surface-variant')}>
              {charCount} / {maxChars}
            </span>
          </div>
        </div>

        {error && <div className="rounded-lg bg-[var(--co-error)]/10 p-3 text-sm text-[var(--co-error)]">{error}</div>}

        <div className="flex justify-end gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
          )}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={cn('btn', isValid && !isSubmitting ? 'btn-primary' : 'cursor-not-allowed bg-surface-container-highest text-on-surface-variant')}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Posting...' : parentComment ? 'Post Reply' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  )
}
