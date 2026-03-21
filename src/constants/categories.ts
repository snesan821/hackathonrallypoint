/**
 * Civic categories, types, and action ladder constants for RallyPoint
 */

import type { Category, CivicItemType, JurisdictionLevel, EngagementAction } from '@prisma/client'

// ============================================================================
// CIVIC CATEGORIES
// ============================================================================

export interface CategoryMeta {
  value: Category
  label: string
  icon: string // Lucide icon name
  color: string // Tailwind color class
  description: string
}

export const CIVIC_CATEGORIES: CategoryMeta[] = [
  {
    value: 'HOUSING',
    label: 'Housing',
    icon: 'Home',
    color: 'bg-blue-500',
    description: 'Rent control, affordable housing, tenant rights',
  },
  {
    value: 'EDUCATION',
    label: 'Education',
    icon: 'GraduationCap',
    color: 'bg-purple-500',
    description: 'School funding, curriculum, college affordability',
  },
  {
    value: 'TRANSIT',
    label: 'Transit',
    icon: 'Bus',
    color: 'bg-green-500',
    description: 'Public transportation, bike lanes, walkability',
  },
  {
    value: 'PUBLIC_SAFETY',
    label: 'Public Safety',
    icon: 'Shield',
    color: 'bg-red-500',
    description: 'Police, fire services, emergency response',
  },
  {
    value: 'HEALTHCARE',
    label: 'Healthcare',
    icon: 'Heart',
    color: 'bg-pink-500',
    description: 'Mental health, community health, access to care',
  },
  {
    value: 'JOBS',
    label: 'Jobs & Economy',
    icon: 'Briefcase',
    color: 'bg-amber-500',
    description: 'Employment, minimum wage, worker protections',
  },
  {
    value: 'ENVIRONMENT',
    label: 'Environment',
    icon: 'Leaf',
    color: 'bg-emerald-500',
    description: 'Climate, conservation, sustainability',
  },
  {
    value: 'CIVIL_RIGHTS',
    label: 'Civil Rights',
    icon: 'Scale',
    color: 'bg-indigo-500',
    description: 'Equity, discrimination, voting rights',
  },
  {
    value: 'CITY_SERVICES',
    label: 'City Services',
    icon: 'Building2',
    color: 'bg-cyan-500',
    description: 'Parks, utilities, waste management',
  },
  {
    value: 'BUDGET',
    label: 'Budget & Taxes',
    icon: 'DollarSign',
    color: 'bg-yellow-500',
    description: 'Municipal budgets, taxes, fiscal policy',
  },
  {
    value: 'ZONING',
    label: 'Zoning & Development',
    icon: 'MapPin',
    color: 'bg-orange-500',
    description: 'Land use, construction, urban planning',
  },
  {
    value: 'OTHER',
    label: 'Other',
    icon: 'MoreHorizontal',
    color: 'bg-gray-500',
    description: 'Other civic issues',
  },
]

// Helper to get category metadata
export function getCategoryMeta(category: Category): CategoryMeta {
  return CIVIC_CATEGORIES.find((c) => c.value === category) ?? CIVIC_CATEGORIES[CIVIC_CATEGORIES.length - 1]
}

// ============================================================================
// CIVIC ITEM TYPES
// ============================================================================

export interface CivicTypeMeta {
  value: CivicItemType
  label: string
  description: string
}

export const CIVIC_TYPES: CivicTypeMeta[] = [
  {
    value: 'PETITION',
    label: 'Petition',
    description: 'Community-organized petition for change',
  },
  {
    value: 'BALLOT_INITIATIVE',
    label: 'Ballot Initiative',
    description: 'Measure appearing on election ballot',
  },
  {
    value: 'ORDINANCE',
    label: 'Ordinance',
    description: 'Proposed local law or regulation',
  },
  {
    value: 'PUBLIC_HEARING',
    label: 'Public Hearing',
    description: 'Open forum for community input',
  },
  {
    value: 'COUNCIL_VOTE',
    label: 'Council Vote',
    description: 'City council decision on policy',
  },
  {
    value: 'SCHOOL_BOARD',
    label: 'School Board',
    description: 'School district policy or budget decision',
  },
  {
    value: 'STATE_BILL',
    label: 'State Bill',
    description: 'State-level legislation',
  },
  {
    value: 'CITY_POLICY',
    label: 'City Policy',
    description: 'Municipal policy proposal',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other civic action type',
  },
]

export function getCivicTypeMeta(type: CivicItemType): CivicTypeMeta {
  return CIVIC_TYPES.find((t) => t.value === type) ?? CIVIC_TYPES[CIVIC_TYPES.length - 1]
}

// ============================================================================
// JURISDICTION LEVELS
// ============================================================================

export interface JurisdictionMeta {
  value: JurisdictionLevel
  label: string
}

export const JURISDICTION_LEVELS: JurisdictionMeta[] = [
  { value: 'CITY', label: 'City' },
  { value: 'COUNTY', label: 'County' },
  { value: 'STATE', label: 'State' },
  { value: 'CAMPUS', label: 'Campus' },
  { value: 'DISTRICT', label: 'District' },
]

// ============================================================================
// ENGAGEMENT ACTION LADDER
// ============================================================================

/**
 * Progressive engagement ladder - from lowest to highest commitment
 */
export const ENGAGEMENT_ACTIONS: EngagementAction[] = [
  'VIEW',
  'SAVE',
  'SHARE',
  'COMMENT',
  'SUPPORT',
  'CONTACT_REP',
  'RSVP',
  'VOLUNTEER',
  'SIGN',
  'DOWNLOAD_FORM',
]

export interface ActionMeta {
  action: EngagementAction
  label: string
  description: string
  icon: string // Lucide icon name
  level: number // 1-10, represents commitment level
}

export const ACTION_LABELS: Record<EngagementAction, ActionMeta> = {
  VIEW: {
    action: 'VIEW',
    label: 'Learn More',
    description: 'Read the full details',
    icon: 'Eye',
    level: 1,
  },
  SAVE: {
    action: 'SAVE',
    label: 'Save for Later',
    description: 'Bookmark this issue',
    icon: 'Bookmark',
    level: 2,
  },
  UNSAVE: {
    action: 'UNSAVE',
    label: 'Remove Bookmark',
    description: 'Remove from saved items',
    icon: 'BookmarkX',
    level: 0,
  },
  SHARE: {
    action: 'SHARE',
    label: 'Share',
    description: 'Share with your network',
    icon: 'Share2',
    level: 3,
  },
  COMMENT: {
    action: 'COMMENT',
    label: 'Join Discussion',
    description: 'Add your voice to the conversation',
    icon: 'MessageCircle',
    level: 4,
  },
  SUPPORT: {
    action: 'SUPPORT',
    label: 'Show Support',
    description: 'Publicly support this issue',
    icon: 'ThumbsUp',
    level: 5,
  },
  UNSUPPORT: {
    action: 'UNSUPPORT',
    label: 'Remove Support',
    description: 'Withdraw your support',
    icon: 'ThumbsDown',
    level: 0,
  },
  CONTACT_REP: {
    action: 'CONTACT_REP',
    label: 'Contact Representative',
    description: 'Reach out to your elected officials',
    icon: 'Phone',
    level: 6,
  },
  RSVP: {
    action: 'RSVP',
    label: 'RSVP to Event',
    description: 'Commit to attending',
    icon: 'Calendar',
    level: 7,
  },
  VOLUNTEER: {
    action: 'VOLUNTEER',
    label: 'Volunteer',
    description: 'Help organize and campaign',
    icon: 'Users',
    level: 8,
  },
  SIGN: {
    action: 'SIGN',
    label: 'Sign Petition',
    description: 'Add your signature',
    icon: 'PenTool',
    level: 9,
  },
  DOWNLOAD_FORM: {
    action: 'DOWNLOAD_FORM',
    label: 'Download Official Form',
    description: 'Get the paper form for offline action',
    icon: 'Download',
    level: 6,
  },
  SKIP: {
    action: 'SKIP',
    label: 'Skip',
    description: 'Skip this issue',
    icon: 'SkipForward',
    level: 0,
  },
}

// Helper to get action metadata
export function getActionMeta(action: EngagementAction): ActionMeta {
  return ACTION_LABELS[action]
}

// Get actions sorted by commitment level
export function getActionsByLevel(): ActionMeta[] {
  return Object.values(ACTION_LABELS)
    .filter((a) => a.level > 0) // Exclude UNSAVE, UNSUPPORT
    .sort((a, b) => a.level - b.level)
}

// ============================================================================
// THREAD TYPES
// ============================================================================

export const THREAD_TYPE_LABELS = {
  QUESTION: {
    label: 'Question',
    icon: 'HelpCircle',
    color: 'text-blue-600',
  },
  SUPPORT: {
    label: 'Support',
    icon: 'Heart',
    color: 'text-green-600',
  },
  CONCERN: {
    label: 'Concern',
    icon: 'AlertCircle',
    color: 'text-yellow-600',
  },
  EVIDENCE: {
    label: 'Evidence/Resources',
    icon: 'FileText',
    color: 'text-purple-600',
  },
} as const

// ============================================================================
// STATUS INDICATORS
// ============================================================================

export const STATUS_COLORS = {
  DRAFT: 'bg-gray-400',
  ACTIVE: 'bg-green-500',
  CLOSED: 'bg-gray-600',
  PASSED: 'bg-blue-500',
  FAILED: 'bg-red-500',
  WITHDRAWN: 'bg-orange-500',
} as const

export const STATUS_LABELS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  PASSED: 'Passed',
  FAILED: 'Failed',
  WITHDRAWN: 'Withdrawn',
} as const
