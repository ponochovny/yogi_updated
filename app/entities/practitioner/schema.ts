import type { InternalApi } from 'nitropack'
import { z } from 'zod'
import { userRoles } from '~~/server/auth/config'

export const addPractitionerSchema = z.object({
  email: z.email('Email is not valid'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio must be at most 500 characters')
    .optional(),
  role: z
    .enum([userRoles.MANAGER, userRoles.PRACTITIONER])
    .default(userRoles.PRACTITIONER),
  salaryActive: z.boolean().default(true)
})

export type AddPractitionerInput = z.infer<typeof addPractitionerSchema>

export type StudioMemberItem =
  InternalApi['/api/business/studios/:slug/members']['get']['team'][number]
