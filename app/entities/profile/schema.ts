import { z } from 'zod'

export const updateAvatarSchema = z.object({
	url: z.string().url(),
	providerPublicId: z.string().min(1),
})

export const updateProfileSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	bio: z.string().trim().optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
