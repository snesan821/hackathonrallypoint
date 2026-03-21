/**
 * Share utilities for social media and native sharing
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rallypoint.local'

export interface ShareData {
  title: string
  text?: string
  url: string
}

/**
 * Check if native Web Share API is available
 */
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share
}

/**
 * Share using native Web Share API
 */
export async function nativeShare(data: ShareData): Promise<boolean> {
  if (!canShare()) {
    return false
  }

  try {
    await navigator.share(data)
    return true
  } catch (error: any) {
    // User cancelled or share failed
    if (error.name === 'AbortError') {
      return false
    }
    console.error('Share failed:', error)
    return false
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  }
}

/**
 * Generate share URL for Twitter
 */
export function getTwitterShareUrl(title: string, url: string): string {
  const params = new URLSearchParams({
    text: title,
    url,
    via: 'RallyPoint', // Replace with your Twitter handle if you have one
  })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

/**
 * Generate share URL for Facebook
 */
export function getFacebookShareUrl(url: string): string {
  const params = new URLSearchParams({
    u: url,
  })
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
}

/**
 * Generate share URL for LinkedIn
 */
export function getLinkedInShareUrl(url: string): string {
  const params = new URLSearchParams({
    url,
  })
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
}

/**
 * Generate share URL for email
 */
export function getEmailShareUrl(title: string, url: string, body?: string): string {
  const subject = `Check out this civic issue: ${title}`
  const emailBody = body || `I thought you might be interested in this: ${url}`

  const params = new URLSearchParams({
    subject,
    body: emailBody,
  })
  return `mailto:?${params.toString()}`
}

/**
 * Generate share URL for WhatsApp
 */
export function getWhatsAppShareUrl(title: string, url: string): string {
  const text = `${title}\n\n${url}`
  const params = new URLSearchParams({
    text,
  })
  return `https://wa.me/?${params.toString()}`
}

/**
 * Generate full civic issue URL
 */
export function getCivicIssueUrl(slug: string): string {
  return `${SITE_URL}/issues/${slug}`
}

/**
 * Share a civic issue with title, description, and URL
 */
export async function shareCivicIssue({
  title,
  summary,
  slug,
}: {
  title: string
  summary: string
  slug: string
}): Promise<{ success: boolean; method: 'native' | 'fallback' | null }> {
  const url = getCivicIssueUrl(slug)
  const text = summary.slice(0, 200) + (summary.length > 200 ? '...' : '')

  // Try native share first
  if (canShare()) {
    const success = await nativeShare({
      title,
      text,
      url,
    })

    if (success) {
      return { success: true, method: 'native' }
    }
  }

  // Fallback: copy link to clipboard
  const copied = await copyToClipboard(url)
  return { success: copied, method: copied ? 'fallback' : null }
}

/**
 * Track share event (call your analytics API)
 */
export async function trackShare({
  itemId,
  method,
}: {
  itemId: string
  method: 'native' | 'twitter' | 'facebook' | 'linkedin' | 'email' | 'whatsapp' | 'copy'
}): Promise<void> {
  try {
    // This will be handled by the engagement API
    // Just a placeholder for future analytics integration
    console.log('Share tracked:', { itemId, method })
  } catch (error) {
    console.error('Failed to track share:', error)
  }
}

/**
 * Open share dialog in popup window
 */
export function openSharePopup(url: string, width = 550, height = 420): void {
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2

  window.open(
    url,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,status=0,resizable=1`
  )
}
