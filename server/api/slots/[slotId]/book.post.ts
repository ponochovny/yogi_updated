import { createBooking } from '~~/server/domain/booking/booking.service'
import { updateBookingSchema } from '~/entities/booking/schema'

export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  const slotId = requireRouteParam(event, 'slotId')
  const body = await readValidatedBody(event, updateBookingSchema.parse)
  if (!body.pricingOptionId)
    throwApiError(400, 'Pricing option is required for booking')

  const result = await createBooking(useDb(), {
    userId: user.id,
    slotId,
    pricingOptionId: body.pricingOptionId,
    mode: 'CASH',
    idempotencyKey: getHeader(event, 'idempotency-key')
  })
  return { success: true, bookingId: result.booking.id, data: result }
})
