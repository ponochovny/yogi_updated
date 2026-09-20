import Stripe from 'stripe'
import { handleStripeWebhook } from '~~/server/domain/checkout/checkout.service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-06-24.dahlia'
})

export default defineEventHandler(async event => {
  const body = await readRawBody(event)
  const signature = getHeader(event, 'stripe-signature')
  if (!body || !signature)
    throw createError({
      statusCode: 400,
      message: 'Webhook signature validation failed'
    })

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Invalid Stripe signature'
    throw createError({ statusCode: 400, message: `Webhook Error: ${message}` })
  }

  try {
    await handleStripeWebhook(useDb(), stripeEvent)
  } catch (error) {
    console.error('Stripe webhook processing failed', error)
    throw createError({ statusCode: 500, message: 'Webhook processing failed' })
  }
  return { received: true }
})
