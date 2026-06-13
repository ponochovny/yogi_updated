import type { InternalApi } from 'nitropack'

export const BookingStatus = {
	CONFIRMED: 'CONFIRMED',
	CANCELLED: 'CANCELLED',
	ATTENDED: 'ATTENDED',
} as const

export type BookingItem =
	InternalApi['/api/account/bookings']['get']['bookings'][number]
