import { z } from 'zod'
import { Category } from '@prisma/client'

/**
 * Validation schema for AI-generated civic document summary
 */
export const aiSummarySchema = z.object({
  plainSummary: z.string().min(50, 'Summary must be at least 50 characters'),
  whoAffected: z.string().min(10, 'Who affected must be at least 10 characters'),
  whatChanges: z.string().min(10, 'What changes must be at least 10 characters'),
  whyItMatters: z.string().min(10, 'Why it matters must be at least 10 characters'),
  argumentsFor: z.array(z.string()).min(1, 'Must have at least one argument for').max(10),
  argumentsAgainst: z.array(z.string()).min(1, 'Must have at least one argument against').max(10),
  importantDates: z.array(
    z.object({
      date: z.string(),
      description: z.string(),
    })
  ),
  nextActions: z.array(z.string()).min(1, 'Must have at least one next action').max(10),
  categories: z.array(z.nativeEnum(Category)),
  affectedJurisdictions: z.array(z.string()),
})

export type AISummaryOutput = z.infer<typeof aiSummarySchema>

/**
 * Validation schema for toxicity check response
 */
export const toxicityCheckSchema = z.object({
  score: z.number().min(0).max(1),
  flags: z.array(z.string()),
  suggestion: z.string(),
})

export type ToxicityCheckOutput = z.infer<typeof toxicityCheckSchema>
