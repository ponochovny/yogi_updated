import * as z from 'zod'

export const priceOptionsType = {
  DROP_IN: 'DROP_IN',
  PACK: 'PACK',
  MEMBERSHIP: 'MEMBERSHIP'
} as const

const commonMembershipFields = {
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(50, 'Name must be at most 50 characters long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(500, 'Description must be at most 500 characters long'),
  price: z.number().min(0, 'Price must be a positive number'),
  durationDays: z.number().int().min(1, 'Duration must be at least 1 day'),
  isActive: z.boolean(),
  applicableCategoryIds: z.array(z.string()).optional()
} as const

export const createMembershipSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(priceOptionsType.DROP_IN),
    credits: z
      .number()
      .int()
      .min(1, 'Drop-in memberships require exactly 1 credit')
      .max(1, 'Drop-in memberships require exactly 1 credit'),
    ...commonMembershipFields
  }),
  z.object({
    type: z.literal(priceOptionsType.PACK),
    credits: z
      .number()
      .int()
      .min(1, 'Pack memberships require at least 1 credit'),
    ...commonMembershipFields
  }),
  z.object({
    type: z.literal(priceOptionsType.MEMBERSHIP),
    credits: z.null(),
    ...commonMembershipFields
  })
])

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>
