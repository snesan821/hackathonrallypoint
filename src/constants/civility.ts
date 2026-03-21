/**
 * Community civility rules
 * Displayed to users before posting comments
 */
export const CIVILITY_RULES = [
  'Focus on the issue, not the person',
  'Share evidence when making claims',
  'Respect different perspectives',
  'No personal attacks or harassment',
  'Stay on topic',
] as const

/**
 * Extended community guidelines
 * Can be shown on a dedicated page or in modals
 */
export const COMMUNITY_GUIDELINES = {
  respectfulDialogue: {
    title: 'Respectful Dialogue',
    description:
      'We encourage passionate disagreement, but all participants must remain civil. Attack ideas, not people.',
    examples: [
      'Good: "I disagree with this policy because..."',
      'Bad: "You\'re an idiot for supporting this"',
    ],
  },
  evidenceBased: {
    title: 'Evidence-Based Discussion',
    description:
      'When making claims, especially about facts or statistics, provide sources when possible. Misinformation presented as fact may be removed.',
    examples: [
      'Good: "According to the city report, enrollment increased by 15%"',
      'Bad: "Everyone knows enrollment is down" (without evidence)',
    ],
  },
  stayOnTopic: {
    title: 'Stay On Topic',
    description:
      'Comments should relate to the civic issue being discussed. Off-topic discussions may be removed.',
  },
  noHarassment: {
    title: 'No Harassment or Personal Attacks',
    description:
      'Personal attacks, name-calling, trolling, and harassment are not tolerated and will result in content removal and potential account suspension.',
  },
  noBullying: {
    title: 'No Bullying or Intimidation',
    description:
      'Do not attempt to silence or intimidate other users. Everyone deserves a voice in civic discussions.',
  },
} as const

/**
 * Moderation action thresholds
 */
export const MODERATION_THRESHOLDS = {
  toxicity: {
    autoApprove: 0.3,
    autoFlag: 0.7,
    autoHide: 0.9,
  },
  rateLimit: {
    commentsPerHour: 10,
    engagementsPerMinute: 30,
  },
  fraud: {
    rapidActionsThreshold: 50, // actions in 5 minutes
    duplicatePatternThreshold: 5, // same action in 1 hour
  },
} as const

/**
 * User-facing moderation messages
 */
export const MODERATION_MESSAGES = {
  commentFlagged:
    'Your comment has been flagged for review by our moderation team. It will be visible after review.',
  commentHidden:
    'Your comment was automatically hidden due to potential guideline violations. Please review our community guidelines.',
  rateLimitExceeded:
    'You\'re posting too quickly. Please wait a moment before trying again.',
  accountFlagged:
    'Your account has been flagged for suspicious activity. Some features may be temporarily restricted.',
} as const

/**
 * Flag reasons users can select when reporting content
 */
export const FLAG_REASONS = [
  {
    value: 'SPAM',
    label: 'Spam or Promotional Content',
    description: 'Unwanted advertising or repetitive posts',
  },
  {
    value: 'HARASSMENT',
    label: 'Harassment or Bullying',
    description: 'Personal attacks, intimidation, or targeted harassment',
  },
  {
    value: 'MISINFORMATION',
    label: 'Misinformation',
    description: 'False claims presented as fact without sources',
  },
  {
    value: 'OFF_TOPIC',
    label: 'Off Topic',
    description: 'Not related to the civic issue being discussed',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other guideline violations',
  },
] as const
