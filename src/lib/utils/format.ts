/**
 * Formatting and utility functions for RallyPoint
 */

import { formatDistanceToNow, isPast, differenceInDays } from 'date-fns'
import type { JurisdictionLevel } from '@prisma/client'

// ============================================================================
// DATE & TIME FORMATTING
// ============================================================================

/**
 * Format deadline as relative time with urgency indicators
 * @param date - Deadline date
 * @returns Formatted string like "3 days left" or "Ended 2 weeks ago"
 */
export function formatDeadline(date: Date | string | null | undefined): string {
  if (!date) return 'No deadline'

  const deadline = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const daysUntil = differenceInDays(deadline, now)

  if (isPast(deadline)) {
    const timeAgo = formatDistanceToNow(deadline, { addSuffix: true })
    return `Ended ${timeAgo}`
  }

  if (daysUntil === 0) {
    return 'Ends today'
  }

  if (daysUntil === 1) {
    return 'Ends tomorrow'
  }

  if (daysUntil <= 7) {
    return `${daysUntil} days left`
  }

  if (daysUntil <= 30) {
    const weeks = Math.floor(daysUntil / 7)
    return weeks === 1 ? '1 week left' : `${weeks} weeks left`
  }

  const months = Math.floor(daysUntil / 30)
  return months === 1 ? '1 month left' : `${months} months left`
}

/**
 * Get urgency level for a deadline
 * @param date - Deadline date
 * @returns Urgency level: 'critical' | 'high' | 'medium' | 'low' | 'ended'
 */
export function getDeadlineUrgency(
  date: Date | string | null | undefined
): 'critical' | 'high' | 'medium' | 'low' | 'ended' {
  if (!date) return 'low'

  const deadline = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const daysUntil = differenceInDays(deadline, now)

  if (isPast(deadline)) return 'ended'
  if (daysUntil <= 3) return 'critical'
  if (daysUntil <= 7) return 'high'
  if (daysUntil <= 30) return 'medium'
  return 'low'
}

/**
 * Format a date as "Mar 15, 2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a date with time as "Mar 15, 2026 at 6:00 PM"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ============================================================================
// SUPPORT & PROGRESS FORMATTING
// ============================================================================

/**
 * Format support count with target
 * @param current - Current support count
 * @param target - Target support count
 * @returns Formatted string like "234 / 500 (47%)"
 */
export function formatSupport(
  current: number,
  target?: number | null
): string {
  if (!target) {
    return current.toLocaleString()
  }

  const percentage = Math.round((current / target) * 100)
  return `${current.toLocaleString()} / ${target.toLocaleString()} (${percentage}%)`
}

/**
 * Calculate support percentage
 */
export function getSupportPercentage(
  current: number,
  target?: number | null
): number {
  if (!target || target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

/**
 * Check if support target is reached
 */
export function isTargetReached(
  current: number,
  target?: number | null
): boolean {
  if (!target) return false
  return current >= target
}

// ============================================================================
// JURISDICTION FORMATTING
// ============================================================================

/**
 * Format jurisdiction with level
 * @param jurisdiction - Jurisdiction name (e.g., "Tempe")
 * @param level - Jurisdiction level (e.g., "CITY")
 * @returns Formatted string like "Tempe, City"
 */
export function formatJurisdiction(
  jurisdiction: string,
  level: JurisdictionLevel
): string {
  const levelLabel = level.charAt(0) + level.slice(1).toLowerCase()
  return `${jurisdiction}, ${levelLabel}`
}

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Truncate text at word boundaries
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: "...")
 * @returns Truncated text
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + suffix
  }

  return truncated + suffix
}

/**
 * Generate URL-safe slug from text
 * @param text - Text to slugify
 * @returns URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Extract initials from name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials (default: 2)
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  const words = name.trim().split(/\s+/)
  const initials = words
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
  return initials
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format large numbers with abbreviations
 * @param num - Number to format
 * @returns Formatted string like "1.2K" or "3.4M"
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  return `${(num / 1000000).toFixed(1)}M`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate US ZIP code
 */
export function isValidZipCode(zip: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zip)
}

// ============================================================================
// SHARING & URLS
// ============================================================================

/**
 * Generate share URL for a civic item
 */
export function generateShareUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/issues/${slug}`
}

/**
 * Generate share text for a civic item
 */
export function generateShareText(title: string, summary: string): string {
  const truncatedSummary = truncate(summary, 100)
  return `Check out this civic issue: ${title}. ${truncatedSummary}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get urgency color classes based on deadline
 */
export function getDeadlineColorClasses(
  date: Date | string | null | undefined
): {
  bg: string
  text: string
  border: string
} {
  const urgency = getDeadlineUrgency(date)

  switch (urgency) {
    case 'critical':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
      }
    case 'high':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
      }
    case 'medium':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
      }
    case 'ended':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-300',
      }
    default:
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
      }
  }
}

// ============================================================================
// GENERAL UTILITIES
// ============================================================================

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Create a random ID
 */
export function randomId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
