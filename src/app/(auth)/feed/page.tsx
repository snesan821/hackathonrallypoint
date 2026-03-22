import { getCurrentUserCached } from '@/lib/auth/server'
import { getCivicItemsPage } from '@/lib/civic/items'
import { FeedPageClient } from '@/components/feed/FeedPageClient'
import { Category, CivicItemType } from '@prisma/client'

type SearchParams = Record<string, string | string[] | undefined>

function getFirstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const categoryValue = getFirstValue(resolvedSearchParams.category)
  const typeValue = getFirstValue(resolvedSearchParams.type)
  const sort = getFirstValue(resolvedSearchParams.sort) || 'deadline'

  const user = await getCurrentUserCached()
  const result = await getCivicItemsPage(
    {
      category: categoryValue as Category | null,
      type: typeValue as CivicItemType | null,
      sort: sort as 'deadline' | 'newest' | 'trending' | 'support',
      page: 1,
      pageSize: 12,
    },
    user?.id
  )

  const totalPages = Math.ceil(result.totalCount / result.pageSize)

  return (
    <FeedPageClient
      initialItems={result.items}
      initialTotalCount={result.totalCount}
      initialHasMore={result.page < totalPages}
      category={categoryValue as Category | null}
      type={typeValue as CivicItemType | null}
      sort={sort}
    />
  )
}
