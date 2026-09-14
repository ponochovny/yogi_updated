import { eq, and, sql, asc } from 'drizzle-orm'
import { z } from 'zod'
import Stripe from 'stripe'
import {
  transactions,
  TransactionStatus
} from '~~/server/db/schema/payment'
import { bookings } from '~~/server/db/schema/booking'
import {
  offeringSlots,
  offerings
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
import { revertPendingCheckoutState } from '~~/server/utils/checkout'
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

  // 2. Guard: If transaction is already SUCCESSFUL, return early indicating it was paid!
  if (txRecord.status === TransactionStatus.SUCCESS) {
    return {
      success: true,
      isAlreadyPaid: true,
      transaction: {
        id: txRecord.id,
        amount: txRecord.amount,
        currency: txRecord.currency,
        status: txRecord.status,
        createdAt: txRecord.createdAt
      },
      successUrl: `/checkout/success?transactionId=${txRecord.id}`
    }
  }

  // 3. If transaction is PENDING, verify with Stripe to make sure it was not paid before reverting!
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
        // Payment was completed in Stripe! Mark SUCCESS and confirm booking
        await db
          .update(transactions)
          .set({ status: TransactionStatus.SUCCESS, updatedAt: new Date() })
          .where(eq(transactions.id, transactionId))

        const [pendingBooking] = await db
          .select({ id: bookings.id })
          .from(bookings)
          .where(eq(bookings.transactionId, transactionId))
          .limit(1)

        if (pendingBooking) {
          await db
            .update(bookings)
            .set({ status: BookingStatus.CONFIRMED, updatedAt: new Date() })
            .where(eq(bookings.id, pendingBooking.id))
        }

        return {
          success: true,
          isAlreadyPaid: true,
          transaction: {
            id: txRecord.id,
            amount: txRecord.amount,
            currency: txRecord.currency,
            status: TransactionStatus.SUCCESS,
            createdAt: txRecord.createdAt
          },
          successUrl: `/checkout/success?transactionId=${txRecord.id}`
        }
      }
    } catch (stripeErr) {
      console.warn('Could not verify Stripe session status on cancel check:', stripeErr)
    }
  }

  // 4. Truly cancelled/pending: release the seat/slot immediately so others or this user can re-book
  if (txRecord.status === TransactionStatus.PENDING) {
    const [pendingBooking] = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.transactionId, transactionId))
      .limit(1)

    await revertPendingCheckoutState(db, transactionId, pendingBooking?.id || null)
    txRecord.status = TransactionStatus.FAILED

    // Attempt to expire Stripe checkout session if still open
    if (txRecord.providerTransactionId && process.env.STRIPE_SECRET_KEY) {
      try {
        await stripe.checkout.sessions.expire(txRecord.providerTransactionId)
      } catch (stripeErr) {
        console.warn('Could not expire Stripe session on checkout cancel:', stripeErr)
      }
    }
  }

  // 5. Fetch details of what was attempted to be purchased
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
        city: studioLocations.city
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

  // Fetch studio info if booking not found
  let studio = userBooking?.studio || null
  if (!studio && txRecord.studioId) {
    const [studioRecord] = await db
      .select({
        id: studios.id,
        name: studios.name,
        slug: studios.slug,
        address: studioLocations.address,
        city: studioLocations.city
      })
      .from(studios)
      .leftJoin(studioLocations, eq(studios.id, studioLocations.studioId))
      .where(eq(studios.id, txRecord.studioId))
      .limit(1)

    studio = studioRecord || null
  }

  const retryUrl = userBooking?.offering?.slug
    ? `/offerings/${userBooking.offering.slug}`
    : studio?.slug
      ? `/studios/${studio.slug}`
      : '/'

  return {
    success: true,
    isAlreadyPaid: false,
    type: userBooking ? ('BOOKING' as const) : ('PASS' as const),
    transaction: {
      id: txRecord.id,
      amount: txRecord.amount,
      currency: txRecord.currency,
      status: txRecord.status,
      createdAt: txRecord.createdAt
    },
    booking: userBooking || null,
    studio: studio || null,
    retryUrl
  }
})
