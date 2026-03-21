import { z } from 'zod'

/**
 * Address validation schema
 */
export const addressSchema = z.object({
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters')
    .refine(
      (addr) => /\d/.test(addr),
      'Address must contain a street number'
    ),
})

export type AddressInput = z.infer<typeof addressSchema>
