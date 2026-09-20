import { z } from 'zod'
import { cancelCheckoutForUser } from '~~/server/domain/checkout/checkout.service'

const querySchema = z.object({ transactionId: z.uuid() })

export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  const query = querySchema.safeParse(getQuery(event))
  if (!query.success) throwApiError(400, 'Invalid or missing transaction ID')

  const cancelled = await cancelCheckoutForUser(
    useDb(),
    query.data.transactionId,
    user.id
  )
  return { success: true, cancelled }
})
