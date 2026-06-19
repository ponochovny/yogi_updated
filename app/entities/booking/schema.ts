import type { InternalApi } from 'nitropack'
import * as z from 'zod'

export const BookingStatus = {
	CONFIRMED: 'CONFIRMED',
	CANCELLED: 'CANCELLED',
	ATTENDED: 'ATTENDED',
	NO_SHOW: 'NO_SHOW',
} as const

export const updateBookingStatusSchema = z.object({
	status: z.enum([
		BookingStatus.ATTENDED,
		BookingStatus.NO_SHOW,
		BookingStatus.CONFIRMED,
	]),
})

export type BookingItem =
	InternalApi['/api/account/bookings']['get']['bookings'][number]
