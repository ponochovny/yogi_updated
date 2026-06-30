import type { InternalApi } from 'nitropack'
import * as z from 'zod'

export const BookingStatus = {
	ACTIVE: 'ACTIVE',
	CONFIRMED: 'CONFIRMED',
	CANCELLED: 'CANCELLED',
	ATTENDED: 'ATTENDED',
	NO_SHOW: 'NO_SHOW',
	COMPLETED: 'COMPLETED',
} as const

export const updatableBookingStatuses = [
	BookingStatus.ACTIVE,
	BookingStatus.CONFIRMED,
	BookingStatus.CANCELLED,
	BookingStatus.ATTENDED,
	BookingStatus.NO_SHOW,
	BookingStatus.COMPLETED,
] as const

export const updateBookingStatusSchema = z.object({
	status: z.enum(updatableBookingStatuses),
})

export const updateBookingSchema = z.object({
	pricingOptionId: z.string(),
})

export type BookingItem =
	InternalApi['/api/account/bookings']['get']['bookings'][number]
