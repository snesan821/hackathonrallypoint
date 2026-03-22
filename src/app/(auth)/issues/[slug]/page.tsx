import { notFound } from 'next/navigation'
import { getCurrentUserCached } from '@/lib/auth/server'
import { getCivicItemDetail } from '@/lib/civic/detail'
import { IssueDetailPageClient } from '@/components/issues/IssueDetailPageClient'

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [{ slug }, user] = await Promise.all([params, getCurrentUserCached()])

  const item = await getCivicItemDetail(slug, user?.id)

  if (!item) {
    notFound()
  }

  return <IssueDetailPageClient initialItem={item} />
}
