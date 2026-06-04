import { z } from 'zod'

export const createStudioSchema = z.object({
	name: z.string().trim().min(1, 'Studio name is required'),
	currency: z.string().trim().min(3),
	bio: z.string().trim().min(1, 'Studio bio is required'),
	mission: z.string().trim().min(1, 'Studio mission is required'),
	categories: z.array(z.string()).min(1, 'Choose at least one category'),
	types: z.array(z.string()).min(1, 'Choose at least one type'),

	locations: z
		.array(
			z.object({
				name: z.string().trim().min(1, 'Location name is required'),
				country: z.string().trim().min(1, 'Country is required'),
				city: z.string().trim().min(1, 'City is required'),
				address: z.string().trim().min(1, 'Address is required'),
				timezone: z.string().trim().min(1, 'Timezone is required'),
			}),
		)
		.min(1, 'At least one location is required'),

	logo: z
		.object({
			url: z.url('Invalid URL format for logo'),
			providerPublicId: z
				.string()
				.trim()
				.min(1, 'Provider public ID is required for logo'),
		})
		.optional(),
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

export type CreateStudioInput = z.infer<typeof createStudioSchema>
