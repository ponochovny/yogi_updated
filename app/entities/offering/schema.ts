import * as z from 'zod'
import type { InternalApi } from 'nitropack'

export type OfferingItem =
  InternalApi['/api/offerings']['get']['offerings'][number]

export type OfferingItemBusiness =
  InternalApi['/api/business/studios/:slug/offerings']['get']['offerings'][number]

export const offeringSlotStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export const offeringType = {
  GROUP: 'GROUP',
  PRIVATE: 'PRIVATE'
} as const

export const pricingType = {
  DROP_IN: 'DROP_IN',
  PACK: 'PACK',
  MEMBERSHIP: 'MEMBERSHIP'
} as const

export const ActivityType = {
  CLASS: 'CLASS',
  APPOINTMENT: 'APPOINTMENT',
  EVENT: 'EVENT'
} as const

export const createOfferingSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  activityType: z.enum([
    ActivityType.CLASS,
    ActivityType.APPOINTMENT,
    ActivityType.EVENT
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
          .min(1, 'Provider public ID is required for logo')
      })
    )
    .optional(),
  // type: 'DROP_IN', offeringId: 'id', applicableCategoryIds: null
  tickets: z.array(
    z.object({
      name: z.string().min(1, 'Ticket name is required'),
      price: z.number().min(0, 'Ticket price must be a positive number'),
      description: z.string().optional()
    })
  )
})

export const updateOfferingSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  activityType: z.enum([
    ActivityType.CLASS,
    ActivityType.APPOINTMENT,
    ActivityType.EVENT
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
          .min(1, 'Provider public ID is required for logo')
      })
    )
    .optional(),
  // type: 'DROP_IN', offeringId: 'id', applicableCategoryIds: null
  tickets: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'Ticket name is required'),
      price: z.number().min(0, 'Ticket price must be a positive number'),
      description: z.string().optional()
    })
  )
})

export type CreateOfferingInput = z.infer<typeof createOfferingSchema>

export const createSlotSchema = z.object({
  startDate: z.string(), // Expected in 'YYYY-MM-DD' format
  endDate: z.string(), // Expected in 'YYYY-MM-DD' format
  rules: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6), // 0 (Sun) - 6 (Sat)
      startTime: z.string(), // Expected in 'HH:mm' format
      endTime: z.string(), // Expected in 'HH:mm' format
      practitionerId: z.uuid()
    })
  )
})
