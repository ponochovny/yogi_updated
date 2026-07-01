import { useDb } from '../db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { userRoles } from '../../auth/config'
import { customSession } from 'better-auth/plugins'
import { and, eq } from 'drizzle-orm'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '../../db/schema/_other'
import { user as userSchema } from '~~/server/db/schema/auth-schema'
import { studioMembers, studios } from '~~/server/db/schema/studio'

export const auth = betterAuth({
  database: drizzleAdapter(useDb(), {
    provider: 'pg'
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const parsedUrl = new URL(url)
      const callbackURL = parsedUrl.searchParams.get('callbackURL') || ''

      const isInvite = callbackURL.includes('flow=invite')
      const studioName = new URLSearchParams(callbackURL.split('?')[1]).get(
        'studioName'
      )

      if (isInvite) {
        void sendPractitionerInvite({
          to: user.email,
          name: user.name,
          studioName: studioName,
          inviteLink: url
        })
      } else {
        void sendPasswordReset({
          to: user.email,
          name: user.name,
          resetLink: url
        })
      }
    },
    onPasswordReset: async ({ user }) => {
      const db = useDb()
      await db
        .update(userSchema)
        .set({ emailVerified: true })
        .where(eq(userSchema.id, user.id))

      console.log(`Email verified for user: ${user.id} post-reset.`)
    }
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production'
  },
  user: {
    additionalFields: {
      bio: {
        type: 'string',
        required: false
      },
      role: {
        type: 'string[]',
        defaultValue() {
          return [userRoles.USER]
        },
        required: false,
        input: false
      },
      workspaces: {
        type: 'json',
        required: false,
        input: false
      }
    }
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const db = useDb()

      const [avatarFile] = await db
        .select({ url: mediaFiles.url })
        .from(mediaFiles)
        .where(
          and(
            eq(mediaFiles.entityId, user.id),
            eq(mediaFiles.entityType, MediaEntityTypeEnum.USER),
            eq(mediaFiles.type, MediaTypeEnum.AVATAR)
          )
        )
        .limit(1)

      if (avatarFile) {
        user.image = avatarFile.url
      }

      const workspaces = await db
        .select({
          role: studioMembers.role,
          studio: {
            id: studios.id,
            slug: studios.slug,
            name: studios.name
          }
        })
        .from(studioMembers)
        .innerJoin(studios, eq(studios.id, studioMembers.studioId))
        .where(eq(studioMembers.userId, user.id))

      return {
        ...session,
        user: {
          ...user,
          workspaces
        }
      }
    })
  ]
})
