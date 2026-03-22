'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CategoryBadge } from '@/components/civic/CategoryBadge'
import { DeadlineChip } from '@/components/civic/DeadlineChip'
import { SupportBar } from '@/components/civic/SupportBar'
import { QuickActions } from '@/components/civic/QuickActions'
import { ActionLadder } from '@/components/civic/ActionLadder'
import { CommunityDiscussion } from '@/components/community/CommunityDiscussion'
import { ArrowLeft, ExternalLink, CheckCircle2, Users } from 'lucide-react'
import { EngagementAction, ThreadType } from '@prisma/client'
import type { CivicItemDetail } from '@/lib/civic/detail'

interface IssueDetailPageClientProps {
  initialItem: CivicItemDetail
}

export function IssueDetailPageClient({ initialItem }: IssueDetailPageClientProps) {
  const slug = initialItem.slug
  const [item, setItem] = useState(initialItem)
  const [comments, setComments] = useState<any[]>([])
  const [commentCount, setCommentCount] = useState(initialItem.commentCount || 0)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'discussion' | 'updates'>(
    'details'
  )

  const fetchComments = async () => {
    setIsLoadingComments(true)
    try {
      const res = await fetch(`/api/civic-items/${slug}/comments?pageSize=20`)
      const data = await res.json()

      if (data.success) {
        setComments(data.data)
        setCommentCount(data.pagination.totalCount)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleTabChange = async (nextTab: 'details' | 'discussion' | 'updates') => {
    setActiveTab(nextTab)
    if (nextTab === 'discussion' && comments.length === 0 && !isLoadingComments) {
      await fetchComments()
    }
  }

  const handleEngage = async (action: EngagementAction) => {
    try {
      const res = await fetch(`/api/civic-items/${slug}/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (data.success) {
        setItem((prev) => ({
          ...prev,
          currentSupport: data.data.currentSupport || prev.currentSupport,
          userEngagement: data.data.userEngagement,
        }))
      }
    } catch (error) {
      console.error('Engagement failed:', error)
      throw error
    }
  }

  const handlePostComment = async (
    body: string,
    threadType: ThreadType,
    parentId?: string
  ) => {
    const res = await fetch(`/api/civic-items/${slug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, threadType, parentId }),
    })

    const data = await res.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to post comment')
    }

    await fetchComments()
    setCommentCount((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-surface-container-lowest">
        <div className="site-wrap py-8">
          <Link
            href="/feed"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Feed
          </Link>

          <div className="mb-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {(item.categories[0] || item.category) && (
                <CategoryBadge category={item.categories[0] || item.category!} size="sm" showIcon />
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded bg-surface-container-high px-2 py-1 font-medium text-on-surface-variant">
                  {item.jurisdictionTags[0]}
                </span>
                <span className="rounded bg-surface-container-high px-2 py-1 font-medium text-on-surface-variant">
                  {item.type.replace('_', ' ')}
                </span>
              </div>
              {item.isVerified && (
                <div className="ml-auto flex items-center gap-1 text-[var(--co-success)]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
            <h1 className="mb-4 text-4xl font-bold text-on-surface font-headline">{item.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              {item.deadline && <DeadlineChip deadline={new Date(item.deadline)} />}
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Users className="h-4 w-4" />
                <span>{item.engagementCount} people engaged</span>
              </div>
              {commentCount > 0 && (
                <span className="text-sm text-on-surface-variant">{commentCount} comments</span>
              )}
            </div>
          </div>

          {item.targetSupport && (
            <div className="mb-6">
              <SupportBar
                currentSupport={item.currentSupport}
                targetSupport={item.targetSupport}
              />
            </div>
          )}

          <QuickActions
            civicItemId={item.id}
            civicItemSlug={slug}
            currentSupport={item.currentSupport}
            userActions={(item.userEngagement?.actions || []) as EngagementAction[]}
            onEngage={handleEngage}
          />
        </div>
      </div>

      <div className="site-wrap grid gap-8 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 border-b border-outline-variant/15">
            <div className="flex gap-6">
              {[
                { id: 'details', label: 'Full Details' },
                { id: 'discussion', label: `Discussion (${commentCount})` },
                { id: 'updates', label: `Updates (${item.organizerUpdates?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6">
                <h2 className="mb-4 text-xl font-bold text-on-surface font-headline">
                  Full Description
                </h2>
                <div className="prose prose-sm max-w-none text-on-surface-variant">
                  {item.fullDescription || item.summary}
                </div>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-container"
                  >
                    View Original Source <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <CommunityDiscussion
              civicItemSlug={slug}
              initialComments={comments}
              totalCount={commentCount}
              onPostComment={handlePostComment}
            />
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              {item.organizerUpdates?.map((update) => (
                <div
                  key={update.id}
                  className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-surface-container-high">
                      {update.author.avatarUrl ? (
                        <img
                          src={update.author.avatarUrl}
                          alt={update.author.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-on-surface-variant">
                          {update.author.displayName[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{update.author.displayName}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <h3 className="mb-2 font-semibold text-on-surface">{update.title}</h3>
                  <p className="text-on-surface-variant">{update.body}</p>
                </div>
              ))}
              {item.organizerUpdates?.length === 0 && (
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-12 text-center">
                  <p className="text-on-surface-variant">No updates yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <ActionLadder
              civicItemId={item.id}
              slug={slug}
              userActions={(item.userEngagement?.actions || []) as EngagementAction[]}
              allowsOnlineSignature={item.allowsOnlineSignature}
              officialActionUrl={item.officialActionUrl}
              onEngage={handleEngage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
