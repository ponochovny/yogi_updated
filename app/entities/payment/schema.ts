import * as z from 'zod'

export const createSessionSchema = z.object({
  pricingOptionId: z.uuid(),
  slotId: z.uuid().optional()
})

export const PaymentMetadataSchema = z.object({
  transactionId: z.uuid(),
  bookingId: z
    .string()
    .trim()
    .transform(val => (val === '' ? null : val)) // Stripe converts null to empty string, so we need to handle that case
    .pipe(z.uuid().nullable()),
  pricingOptionId: z.uuid(),
  userId: z.string()
})
