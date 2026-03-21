'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CategoryBadgeList } from '@/components/civic/CategoryBadge'
import { DeadlineChip } from '@/components/civic/DeadlineChip'
import { SupportBar } from '@/components/civic/SupportBar'
import { QuickActions } from '@/components/civic/QuickActions'
import { ActionLadder } from '@/components/civic/ActionLadder'
import { AISummarySection } from '@/components/civic/AISummarySection'
import { CommunityDiscussion } from '@/components/community/CommunityDiscussion'
import { ArrowLeft, ExternalLink, CheckCircle2, Users } from 'lucide-react'
import { EngagementAction, ThreadType } from '@prisma/client'

export default function IssueDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'discussion' | 'updates'>('summary')

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/civic-items/${slug}`)
        const data = await res.json()
        if (data.success) setItem(data.data)
      } catch (error) { console.error('Failed to fetch item:', error) }
      finally { setIsLoading(false) }
    }
    fetchItem()
  }, [slug])

  const handleEngage = async (action: EngagementAction) => {
    if (!item) return
    try {
      const res = await fetch(`/api/civic-items/${slug}/engage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        setItem((prev: any) => ({
          ...prev, currentSupport: data.data.currentSupport || prev.currentSupport,
          userEngagement: data.data.userEngagement,
        }))
      }
    } catch (error) { console.error('Engagement failed:', error); throw error }
  }

  const handlePostComment = async (body: string, threadType: ThreadType, parentId?: string) => {
    const res = await fetch(`/api/civic-items/${slug}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, threadType, parentId }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to post comment')
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="site-wrap py-8">
        <div className="space-y-6">
          <div className="h-8 w-48 rounded skeleton" />
          <div className="h-12 w-3/4 rounded skeleton" />
          <div className="h-64 rounded-xl skeleton" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="site-wrap py-8 text-center">
        <h1 className="text-2xl font-bold text-on-surface">Issue not found</h1>
        <Link href="/feed" className="mt-4 inline-block text-primary hover:text-primary-container">← Back to Feed</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <div className="bg-surface-container-lowest">
        <div className="site-wrap py-8">
          <Link href="/feed" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface">
            <ArrowLeft className="h-4 w-4" /> Back to Feed
          </Link>

          <div className="mb-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <CategoryBadgeList categories={item.categories} showIcon />
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded bg-surface-container-high px-2 py-1 font-medium text-on-surface-variant">{item.jurisdictionTags[0]}</span>
                <span className="rounded bg-surface-container-high px-2 py-1 font-medium text-on-surface-variant">{item.type.replace('_', ' ')}</span>
              </div>
              {item.isVerified && (
                <div className="ml-auto flex items-center gap-1 text-[var(--co-success)]">
                  <CheckCircle2 className="h-4 w-4" /><span className="text-sm font-medium">Verified</span>
                </div>
              )}
            </div>
            <h1 className="mb-4 text-4xl font-bold text-on-surface font-headline">{item.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              {item.deadline && <DeadlineChip deadline={new Date(item.deadline)} />}
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Users className="h-4 w-4" /><span>{item.engagementCount} people engaged</span>
              </div>
              {item.commentCount > 0 && <span className="text-sm text-on-surface-variant">{item.commentCount} comments</span>}
            </div>
          </div>

          {item.targetSupport && (
            <div className="mb-6"><SupportBar currentSupport={item.currentSupport} targetSupport={item.targetSupport} /></div>
          )}

          <QuickActions civicItemId={item.id} civicItemSlug={slug} currentSupport={item.currentSupport} userActions={item.userEngagement?.actions || []} onEngage={handleEngage} />
        </div>
      </div>

      {/* Main Content */}
      <div className="site-wrap grid gap-8 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="mb-6 border-b border-outline-variant/15">
            <div className="flex gap-6">
              {[
                { id: 'summary', label: 'Summary' },
                { id: 'details', label: 'Full Details' },
                { id: 'discussion', label: `Discussion (${item.commentCount})` },
                { id: 'updates', label: `Updates (${item.organizerUpdates?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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

          {activeTab === 'summary' && item.aiSummary && <AISummarySection summary={item.aiSummary} />}
          {activeTab === 'summary' && !item.aiSummary && (
            <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6">
              <p className="text-on-surface-variant">AI summary not yet available for this issue.</p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6">
                <h2 className="mb-4 text-xl font-bold text-on-surface font-headline">Full Description</h2>
                <div className="prose prose-sm max-w-none text-on-surface-variant">{item.fullDescription || item.summary}</div>
                {item.sourceUrl && (
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-container">
                    View Original Source <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <CommunityDiscussion civicItemSlug={slug} initialComments={[]} totalCount={item.commentCount} onPostComment={handlePostComment} />
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              {item.organizerUpdates?.map((update: any) => (
                <div key={update.id} className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-surface-container-high">
                      {update.author.avatarUrl ? (
                        <img src={update.author.avatarUrl} alt={update.author.displayName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-on-surface-variant">
                          {update.author.displayName[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{update.author.displayName}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(update.createdAt).toLocaleDateString()}</p>
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

        {/* Right: Action Ladder */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <ActionLadder civicItemId={item.id} slug={slug} userActions={item.userEngagement?.actions || []} allowsOnlineSignature={item.allowsOnlineSignature} officialActionUrl={item.officialActionUrl} onEngage={handleEngage} />
          </div>
        </div>
      </div>
    </div>
  )
}
