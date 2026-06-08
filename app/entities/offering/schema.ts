import * as z from 'zod'
import type { InternalApi } from 'nitropack'

export type OfferingItem = InternalApi['/api/offerings']['get']['offerings'][0]

export const offeringType = {
	GROUP: 'GROUP',
	PRIVATE: 'PRIVATE',
} as const

export const pricingType = {
	DROP_IN: 'DROP_IN',
	PACK: 'PACK',
	MEMBERSHIP: 'MEMBERSHIP',
} as const

export const ActivityType = {
	CLASS: 'CLASS',
	APPOINTMENT: 'APPOINTMENT',
	EVENT: 'EVENT',
} as const

export const createOfferingSchema = z.object({
	name: z.string().min(2),
	description: z.string().optional(),
	activityType: z.enum([
		ActivityType.CLASS,
		ActivityType.APPOINTMENT,
		ActivityType.EVENT,
	]),
	isPrivate: z.boolean(),
	locationId: z.uuid().nullable(), // null means online
	timezone: z.string(),
	duration: z.number().min(5),
	capacity: z.number().nullable(),
	practitionerIds: z.array(z.uuid()).min(1, 'Choose at least one practitioner'),
	gallery: z
		.array(
			z.object({
				url: z.url('Invalid URL format for logo'),
				providerPublicId: z
					.string()
					.trim()
					.min(1, 'Provider public ID is required for logo'),
			}),
		)
		.optional(),
})

export type CreateOfferingInput = z.infer<typeof createOfferingSchema>
