import Anthropic from '@anthropic-ai/sdk'
import { getCivicSummarizationPrompt, getToxicityCheckPrompt } from './prompts'
import { aiSummarySchema, toxicityCheckSchema } from '../validators/ai'
import type { AISummaryOutput, ToxicityCheckOutput } from '../validators/ai'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export function initClaude() {
  return client
}

// Model to use for summarization
const SUMMARIZATION_MODEL = 'claude-3-5-sonnet-20241022'
const TOXICITY_MODEL = 'claude-3-haiku-20240307' // Faster, cheaper for toxicity checks

/**
 * Summarize a civic document using Claude AI
 *
 * @param text - The full document text
 * @param metadata - Document metadata (title, type, jurisdiction)
 * @returns Structured summary data
 */
export async function summarizeCivicDocument(
  text: string,
  metadata: { title?: string; type?: string; jurisdiction?: string }
): Promise<AISummaryOutput> {
  const prompt = getCivicSummarizationPrompt(text, metadata)

  try {
    const result = await withRetry(async () => {
      const message = await client.messages.create({
        model: SUMMARIZATION_MODEL,
        max_tokens: 4096,
        temperature: 0.3, // Lower temperature for more consistent, factual output
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      // Log token usage for cost tracking
      console.log('Claude API usage (summarization):', {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        model: SUMMARIZATION_MODEL,
      })

      // Extract text content
      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Parse JSON response
      let parsedResponse
      try {
        // Remove markdown code blocks if present
        const cleanedText = content.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()

        parsedResponse = JSON.parse(cleanedText)
      } catch (parseError) {
        console.error('Failed to parse Claude response:', content.text)
        throw new Error('Invalid JSON response from Claude')
      }

      // Validate with Zod schema
      const validated = aiSummarySchema.parse(parsedResponse)

      return validated
    })

    return result
  } catch (error: any) {
    console.error('Civic document summarization error:', error)
    throw new Error(
      `Failed to summarize document: ${error.message || 'Unknown error'}`
    )
  }
}

/**
 * Check comment for toxicity using Claude AI
 *
 * @param text - Comment text to check
 * @returns Toxicity score and flags
 */
export async function checkToxicity(text: string): Promise<ToxicityCheckOutput> {
  const prompt = getToxicityCheckPrompt(text)

  try {
    const result = await withRetry(async () => {
      const message = await client.messages.create({
        model: TOXICITY_MODEL,
        max_tokens: 512,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      // Log token usage
      console.log('Claude API usage (toxicity check):', {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        model: TOXICITY_MODEL,
      })

      // Extract and parse response
      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      let parsedResponse
      try {
        const cleanedText = content.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()

        parsedResponse = JSON.parse(cleanedText)
      } catch (parseError) {
        console.error('Failed to parse toxicity check response:', content.text)
        throw new Error('Invalid JSON response from Claude')
      }

      // Validate
      const validated = toxicityCheckSchema.parse(parsedResponse)

      return validated
    })

    return result
  } catch (error: any) {
    console.error('Toxicity check error:', error)

    // Return safe default on error (err on side of caution)
    return {
      score: 0.5,
      flags: ['error-during-check'],
      suggestion: 'Unable to check toxicity. Please review manually.',
    }
  }
}

/**
 * Retry wrapper with exponential backoff
 * Retries up to 3 times for rate limits and transient errors
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Don't retry on validation errors or non-retryable errors
      if (
        error.name === 'ZodError' ||
        error.message?.includes('Invalid JSON') ||
        error.message?.includes('Unexpected response')
      ) {
        throw error
      }

      // Check if it's a rate limit error
      const isRateLimit =
        error.status === 429 || error.message?.includes('rate limit')

      // On last attempt, throw
      if (attempt === maxAttempts) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = isRateLimit
        ? baseDelay * Math.pow(2, attempt - 1)
        : baseDelay * attempt

      console.log(
        `Claude API error (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms:`,
        error.message
      )

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Max retry attempts reached')
}
