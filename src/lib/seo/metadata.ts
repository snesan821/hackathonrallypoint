import { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rallypoint.local'
const SITE_NAME = 'RallyPoint'
const SITE_DESCRIPTION =
  'Discover, understand, and act on local civic issues that matter to you. Join your community in making a difference.'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Civic Engagement for Your Community`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'civic engagement',
    'local issues',
    'community action',
    'petitions',
    'campaigns',
    'local government',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Civic Engagement for Your Community`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Civic Engagement for Your Community`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'google-verification-code',
    // yandex: 'yandex-verification-code',
  },
}

/**
 * Generate metadata for a civic issue detail page
 */
export function generateIssueMetadata({
  title,
  summary,
  slug,
  type,
  categories,
}: {
  title: string
  summary: string
  slug: string
  type: string
  categories: string[]
}): Metadata {
  const url = `${SITE_URL}/issues/${slug}`
  const description = summary.slice(0, 160) + (summary.length > 160 ? '...' : '')

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&type=${type}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/api/og?title=${encodeURIComponent(title)}&type=${type}`],
    },
    keywords: [...categories, 'civic engagement', 'local issue', type],
  }
}

/**
 * Generate JSON-LD structured data for a civic issue
 */
export function generateIssueStructuredData({
  title,
  summary,
  slug,
  publishedAt,
  modifiedAt,
  categories,
  organizerName,
}: {
  title: string
  summary: string
  slug: string
  publishedAt: Date
  modifiedAt: Date
  categories: string[]
  organizerName: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: summary,
    url: `${SITE_URL}/issues/${slug}`,
    datePublished: publishedAt.toISOString(),
    dateModified: modifiedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: organizerName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    keywords: categories.join(', '),
  }
}

/**
 * Generate metadata for user profile page
 */
export function generateProfileMetadata(displayName: string): Metadata {
  return {
    title: `${displayName}'s Profile`,
    description: `View ${displayName}'s civic engagement activity, saved issues, and impact on the community.`,
    robots: {
      index: false, // Don't index user profiles for privacy
      follow: true,
    },
  }
}

/**
 * Generate metadata for discovery/feed pages
 */
export function generateFeedMetadata({
  category,
  jurisdiction,
}: {
  category?: string
  jurisdiction?: string
}): Metadata {
  let title = 'Discover Civic Issues'
  let description = 'Browse and discover local civic issues, petitions, and campaigns in your community.'

  if (category) {
    title = `${category} Issues`
    description = `Discover ${category.toLowerCase()} issues in your community.`
  }

  if (jurisdiction) {
    description += ` Showing issues in ${jurisdiction}.`
  }

  return {
    title,
    description,
  }
}
