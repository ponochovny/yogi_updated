import { user } from '~~/server/db/schema/auth-schema'
import { updateProfileSchema } from '~/entities/profile/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const currentUserId = userData.id

  const body = await readValidatedBody(event, updateProfileSchema.parse)
  const db = useDb()

  try {
    const [updatedUser] = await db
      .update(user)
      .set({
        name: body.name,
        bio: body.bio,
        updatedAt: new Date()
      })
      .where(eq(user.id, currentUserId))
      .returning({
        id: user.id,
        name: user.name,
        bio: user.bio
      })

    return {
      success: true,
      user: updatedUser
    }
  } catch (error: unknown) {
    if (isApiError(error)) throw error
    console.error('Failed to update profile', error)
    throwApiError(500, 'Failed to update profile')
  }
})
