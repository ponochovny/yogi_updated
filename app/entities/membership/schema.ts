import * as z from 'zod'

export const priceOptionsType = {
  DROP_IN: 'DROP_IN',
  PACK: 'PACK',
  MEMBERSHIP: 'MEMBERSHIP'
} as const

const basePricingSchema = z.object({
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
})

export const createMembershipSchema = z.discriminatedUnion('type', [
  // DROP-IN
  basePricingSchema.extend({
    type: z.literal(priceOptionsType.DROP_IN),
    credits: z.literal(1, 'Drop-in requires exactly 1 credit')
  }),

  // PACK: From 2 credits and more (since 1 credit is a DROP_IN)
  basePricingSchema.extend({
    type: z.literal(priceOptionsType.PACK),
    credits: z.number().int().min(2, 'Pack requires at least 2 credits')
  }),

  // MEMBERSHIP: No credits (unlimited time), strictly 0
  basePricingSchema.extend({
    type: z.literal(priceOptionsType.MEMBERSHIP),
    credits: z.literal(0, 'Membership does not use credits')
  })
])

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>
