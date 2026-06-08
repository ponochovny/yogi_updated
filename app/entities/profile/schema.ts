import { z } from 'zod'

export const updateProfileSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	bio: z.string().trim().min(1, 'Bio is required'),
	avatar: z
		.object({
			url: z.url('Invalid URL format for profile image'),
			providerPublicId: z.string().trim(),
		})
		.optional(),
	role: z.array(z.string()).optional(),
})

export type CreateProfileInput = z.infer<typeof updateProfileSchema>
