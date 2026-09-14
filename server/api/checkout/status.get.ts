import { eq, and, sql, asc } from 'drizzle-orm'
import { z } from 'zod'
import Stripe from 'stripe'
import {
  transactions,
  TransactionStatus,
  userPasses,
  UserPassStatus
} from '~~/server/db/schema/payment'
import { bookings } from '~~/server/db/schema/booking'
import {
  offeringSlots,
  offerings,
  pricingOptions
} from '~~/server/db/schema/offering'
import {
  studios,
  studioPractitioners,
  studioLocations
} from '~~/server/db/schema/studio'
import { user as usersTable } from '~~/server/db/schema/auth-schema'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import { BookingStatus } from '~/entities/booking/schema'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-06-24.dahlia'
})

const querySchema = z.object({
  transactionId: z.string().uuid()
})

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const parseResult = querySchema.safeParse(query)

  if (!parseResult.success) {
    throwApiError(400, 'Invalid or missing transaction ID')
  }

  const { transactionId } = parseResult.data
  const user = await requireAuthenticatedUser(event)
  const db = useDb()

  // 1. Fetch transaction and verify ownership
  const [txRecord] = await db
    .select()
    .from(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, user.id))
    )
    .limit(1)

  if (!txRecord) {
    throwApiError(404, 'Transaction not found or unauthorized')
  }

  // 2. If transaction is still pending, verify with Stripe (webhook might be in-transit or delayed)
  if (
    txRecord.status === TransactionStatus.PENDING &&
    txRecord.providerTransactionId &&
    process.env.STRIPE_SECRET_KEY
  ) {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        txRecord.providerTransactionId
      )

      if (session.payment_status === 'paid' || session.status === 'complete') {
        await db.transaction(async tx => {
          const [lockedTx] = await tx
            .select()
            .from(transactions)
            .where(eq(transactions.id, transactionId))
            .for('update')

          if (lockedTx && lockedTx.status === TransactionStatus.PENDING) {
            await tx
              .update(transactions)
              .set({ status: TransactionStatus.SUCCESS, updatedAt: new Date() })
              .where(eq(transactions.id, transactionId))

            txRecord.status = TransactionStatus.SUCCESS

            // If there is an associated pending booking, confirm it
            const [pendingBooking] = await tx
              .select()
              .from(bookings)
              .where(eq(bookings.transactionId, transactionId))

            if (
              pendingBooking &&
              pendingBooking.status === BookingStatus.PENDING
            ) {
              await tx
                .update(bookings)
                .set({ status: BookingStatus.CONFIRMED, updatedAt: new Date() })
                .where(eq(bookings.id, pendingBooking.id))
            } else if (!pendingBooking) {
              // Pass purchase: check if pass is already inserted
              const [existingPass] = await tx
                .select()
                .from(userPasses)
                .where(eq(userPasses.transactionId, transactionId))

              if (!existingPass) {
                const pricingOptionId = session.metadata?.pricingOptionId
                if (pricingOptionId) {
                  const [pricing] = await tx
                    .select()
                    .from(pricingOptions)
                    .where(eq(pricingOptions.id, pricingOptionId))
                    .limit(1)

                  if (pricing) {
                    const durationDays = Number(pricing.durationDays) || 30
                    const validFrom = new Date()
                    const validUntil = new Date(validFrom)
                    validUntil.setDate(validUntil.getDate() + durationDays)

                    await tx.insert(userPasses).values({
                      userId: user.id,
                      studioId: pricing.studioId,
                      pricingOptionId: pricing.id,
                      transactionId: transactionId,
                      status: UserPassStatus.ACTIVE,
                      remainingCredits: pricing.credits,
                      validFrom,
                      validUntil,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    })
                  }
                }
              }
            }
          }
        })
      }
    } catch (stripeErr) {
      console.warn('Could not verify Stripe session in checkout status API:', stripeErr)
    }
  }

  // 3. Check for associated booking
  const firstOfferingMedia = db
    .selectDistinctOn([mediaFiles.entityId], {
      entityId: mediaFiles.entityId,
      url: mediaFiles.url
    })
    .from(mediaFiles)
    .where(
      and(
        eq(mediaFiles.entityType, MediaEntityTypeEnum.OFFERING),
        eq(mediaFiles.type, MediaTypeEnum.GALLERY)
      )
    )
    .orderBy(mediaFiles.entityId, asc(mediaFiles.order))
    .as('first_offering_media')

  const practitionerAvatar = db
    .selectDistinctOn([mediaFiles.entityId], {
      entityId: mediaFiles.entityId,
      url: mediaFiles.url
    })
    .from(mediaFiles)
    .where(
      and(
        eq(mediaFiles.entityType, MediaEntityTypeEnum.USER),
        eq(mediaFiles.type, MediaTypeEnum.AVATAR)
      )
    )
    .as('practitioner_avatar')

  const [userBooking] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      createdAt: bookings.createdAt,
      slot: {
        id: offeringSlots.id,
        startTime: offeringSlots.startTime,
        endTime: offeringSlots.endTime
      },
      offering: {
        id: offerings.id,
        name: offerings.name,
        slug: offerings.slug,
        duration: offerings.duration,
        description: offerings.description,
        coverImage: firstOfferingMedia.url
      },
      studio: {
        id: studios.id,
        name: studios.name,
        slug: studios.slug,
        address: studioLocations.address,
        city: studioLocations.city,
        country: studioLocations.country,
        timezone: studioLocations.timezone
      },
      practitioner: {
        name: usersTable.name,
        avatar: practitionerAvatar.url
      }
    })
    .from(bookings)
    .innerJoin(offeringSlots, eq(bookings.slotId, offeringSlots.id))
    .innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
    .innerJoin(studios, eq(offerings.studioId, studios.id))
    .leftJoin(
      studioPractitioners,
      eq(offeringSlots.practitionerId, studioPractitioners.id)
    )
    .leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
    .leftJoin(usersTable, eq(studioPractitioners.userId, usersTable.id))
    .leftJoin(
      firstOfferingMedia,
      eq(sql`${offerings.id}::text`, firstOfferingMedia.entityId)
    )
    .leftJoin(
      practitionerAvatar,
      eq(
        sql`${studioPractitioners.userId}::text`,
        practitionerAvatar.entityId
      )
    )
    .where(eq(bookings.transactionId, transactionId))
    .limit(1)

  if (userBooking) {
    return {
      success: true,
      type: 'BOOKING' as const,
      customer: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      transaction: {
        id: txRecord.id,
        amount: txRecord.amount,
        currency: txRecord.currency,
        provider: txRecord.provider,
        status: txRecord.status,
        createdAt: txRecord.createdAt
      },
      booking: userBooking
    }
  }

  // 4. If not a booking, check for associated pass
  const [userPass] = await db
    .select({
      id: userPasses.id,
      status: userPasses.status,
      remainingCredits: userPasses.remainingCredits,
      validFrom: userPasses.validFrom,
      validUntil: userPasses.validUntil,
      pricingOption: {
        id: pricingOptions.id,
        name: pricingOptions.name,
        description: pricingOptions.description,
        type: pricingOptions.type,
        credits: pricingOptions.credits,
        durationDays: pricingOptions.durationDays,
        price: pricingOptions.price
      },
      studio: {
        id: studios.id,
        name: studios.name,
        slug: studios.slug,
        bio: studios.bio
      }
    })
    .from(userPasses)
    .innerJoin(pricingOptions, eq(userPasses.pricingOptionId, pricingOptions.id))
    .innerJoin(studios, eq(userPasses.studioId, studios.id))
    .where(eq(userPasses.transactionId, transactionId))
    .limit(1)

  if (userPass) {
    return {
      success: true,
      type: 'PASS' as const,
      customer: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      transaction: {
        id: txRecord.id,
        amount: txRecord.amount,
        currency: txRecord.currency,
        provider: txRecord.provider,
        status: txRecord.status,
        createdAt: txRecord.createdAt
      },
      pass: userPass
    }
  }

  // 5. Fallback: return transaction with studio details
  const [studio] = await db
    .select({
      id: studios.id,
      name: studios.name,
      slug: studios.slug,
      bio: studios.bio
    })
    .from(studios)
    .where(eq(studios.id, txRecord.studioId))
    .limit(1)

  return {
    success: true,
    type: 'GENERIC' as const,
    customer: {
      id: user.id,
      name: user.name,
      email: user.email
    },
    transaction: {
      id: txRecord.id,
      amount: txRecord.amount,
      currency: txRecord.currency,
      provider: txRecord.provider,
      status: txRecord.status,
      createdAt: txRecord.createdAt
    },
    studio: studio || null
  }
})
