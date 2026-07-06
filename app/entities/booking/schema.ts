import type { InternalApi } from 'nitropack'
import * as z from 'zod'

export const BookingStatus = {
  ACTIVE: 'ACTIVE',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  ATTENDED: 'ATTENDED',
  NO_SHOW: 'NO_SHOW',
  COMPLETED: 'COMPLETED'
} as const

export const updatableBookingStatuses = [
  BookingStatus.ACTIVE,
  BookingStatus.CONFIRMED,
  BookingStatus.CANCELLED,
  BookingStatus.ATTENDED,
  BookingStatus.NO_SHOW,
  BookingStatus.COMPLETED
] as const

export const createBookingSchema = z
  .object({
    pricingOptionId: z.string().uuid().optional(),
    userPassId: z.string().uuid().optional()
  })
  .refine(data => Boolean(data.pricingOptionId) !== Boolean(data.userPassId), {
    message: 'Provide exactly one of pricingOptionId or userPassId'
  })

export const updateBookingStatusSchema = z.object({
  status: z.enum(updatableBookingStatuses)
})

export const updateBookingSchema = z.object({
  pricingOptionId: z.string()
})

export type BookingItem =
  InternalApi['/api/account/bookings']['get']['bookings'][number]

export type OfferingSlot =
  InternalApi['/api/offerings/:offeringSlug/slots']['get']['slots'][number]

export type BookingOptions =
  InternalApi['/api/bookings/:slotId/options']['get']['options']
