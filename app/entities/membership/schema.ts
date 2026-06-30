import * as z from 'zod'

export const priceOptionsType = {
	DROP_IN: 'DROP_IN',
	PACK: 'PACK',
	MEMBERSHIP: 'MEMBERSHIP',
} as const

export const createMembershipSchema = z.object({
	name: z
		.string()
		.min(3, 'Name must be at least 3 characters long')
		.max(50, 'Name must be at most 50 characters long'),
	description: z
		.string()
		.min(10, 'Description must be at least 10 characters long')
		.max(500, 'Description must be at most 500 characters long'),
	type: z.enum([
		priceOptionsType.DROP_IN,
		priceOptionsType.PACK,
		priceOptionsType.MEMBERSHIP,
	]),
	price: z.number().min(0, 'Price must be a positive number'),

	// Limits logic
	credits: z.number().nullable().optional(), // Visits amount. For DROP_IN = 1, PACK = 10, MEMBERSHIP = null (unlimited)
	durationDays: z.number().min(1, 'Duration must be at least 1 day'), // Duration of the pass after purchase (e.g., 1 day, 30 days, 365 days)

	isActive: z.boolean(),
	applicableCategoryIds: z.array(z.string()).optional(),
})

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>
