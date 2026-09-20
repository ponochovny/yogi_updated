import { createBooking } from '~~/server/domain/booking/booking.service'
import { createBookingSchema } from '~/entities/booking/schema'

export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  const slotId = requireRouteParam(event, 'slotId')
  const body = await readValidatedBody(event, createBookingSchema.parse)
  const result = await createBooking(useDb(), {
    userId: user.id,
    slotId,
    pricingOptionId: body.pricingOptionId,
    userPassId: body.userPassId,
    idempotencyKey: getHeader(event, 'idempotency-key')
  })

  return {
    success: true,
    message:
      result.type === 'PASS'
        ? 'Booked successfully using your membership pass!'
        : 'Booked successfully! Please pay cash at the studio reception.',
    data: result
  }
})
