import { createCheckoutSession } from '~~/server/domain/checkout/checkout.service'
import { createSessionSchema } from '~/entities/payment/schema'

export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  const body = await readValidatedBody(event, createSessionSchema.parse)
  const idempotencyKey = getHeader(event, 'idempotency-key')
  if (!idempotencyKey) throwApiError(400, 'Idempotency-Key header is required')

  return createCheckoutSession(useDb(), {
    userId: user.id,
    email: user.email,
    pricingOptionId: body.pricingOptionId,
    slotId: body.slotId,
    idempotencyKey
  })
})
