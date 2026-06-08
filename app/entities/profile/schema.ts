import { z } from 'zod'

export const updateAvatarSchema = z.object({
	url: z.string().url(),
	providerPublicId: z.string().min(1),
})

export const updateProfileSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	bio: z.string().trim().min(1, 'Bio is required'),
	// avatar: z
	// 	.object({
	// 		url: z.url('Invalid URL format for profile image'),
	// 		providerPublicId: z.string().trim(),
	// 	})
	// 	.optional(),
	role: z.array(z.string()).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
