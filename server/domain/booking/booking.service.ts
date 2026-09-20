import { and, eq, gte, inArray, isNull, lte, or, sql } from 'drizzle-orm'
import { BookingStatus } from '../../../app/entities/booking/schema'
import { priceOptionsType } from '../../../app/entities/membership/schema'
import {
  offeringSlots,
  offerings,
  pricingOptions
} from '../../db/schema/offering'
import { bookings } from '../../db/schema/booking'
import {
  TransactionProvider,
  transactions,
  TransactionStatus,
  userPasses,
  UserPassStatus
} from '../../db/schema/payment'
import { studios } from '../../db/schema/studio'
import { studioWaiverConsents } from '../../db/schema/waiver'

type Database = ReturnType<typeof useDb>
type BookingMode = 'CASH' | 'STRIPE'

export interface CreateBookingInput {
  userId: string
  slotId: string
  pricingOptionId?: string | null
  userPassId?: string | null
  mode?: BookingMode
  idempotencyKey?: string | null
}

export async function createBooking(db: Database, input: CreateBookingInput) {
  return db.transaction(async tx => {
    const [waiver] = await tx
      .select({
        studioId: studios.id,
        text: studios.liabilityWaiver,
        version: studios.liabilityWaiverVersion
      })
      .from(offeringSlots)
      .innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
      .innerJoin(studios, eq(offerings.studioId, studios.id))
      .where(eq(offeringSlots.id, input.slotId))
      .limit(1)
    if (!waiver)
      throw createError({ statusCode: 404, message: 'Time slot not found' })
    if (waiver.text) {
      const [consent] = await tx
        .select({ id: studioWaiverConsents.id })
        .from(studioWaiverConsents)
        .where(
          and(
            eq(studioWaiverConsents.studioId, waiver.studioId),
            eq(studioWaiverConsents.userId, input.userId),
            eq(studioWaiverConsents.waiverVersion, waiver.version)
          )
        )
        .limit(1)
      if (!consent)
        throw createError({
          statusCode: 428,
          message: 'Studio waiver consent is required'
        })
    }

    if (input.idempotencyKey) {
      const [existingTransaction] = await tx
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, input.userId),
            eq(transactions.idempotencyKey, input.idempotencyKey)
          )
        )
        .limit(1)

      if (
        existingTransaction &&
        (existingTransaction.status === TransactionStatus.PENDING ||
          existingTransaction.status === TransactionStatus.SUCCESS)
      ) {
        const [existingBooking] = await tx
          .select()
          .from(bookings)
          .where(
            and(
              eq(bookings.transactionId, existingTransaction.id),
              eq(bookings.slotId, input.slotId),
              inArray(bookings.status, [
                BookingStatus.PENDING,
                BookingStatus.CONFIRMED,
                BookingStatus.ATTENDED,
                BookingStatus.NO_SHOW
              ])
            )
          )
          .limit(1)

        if (existingBooking && input.pricingOptionId) {
          const [pricing] = await tx
            .select({
              studioId: pricingOptions.studioId,
              price: pricingOptions.price
            })
            .from(pricingOptions)
            .where(eq(pricingOptions.id, input.pricingOptionId))
            .limit(1)

          if (
            pricing &&
            pricing.studioId === existingTransaction.studioId &&
            pricing.price === existingTransaction.amount
          ) {
            return {
              booking: existingBooking,
              transaction: existingTransaction
            }
          }
        }
      }
    }

    const [slot] = await tx
      .select({
        id: offeringSlots.id,
        status: offeringSlots.status,
        capacityOverride: offeringSlots.capacityOverride,
        offeringId: offeringSlots.offeringId,
        startTime: offeringSlots.startTime
      })
      .from(offeringSlots)
      .where(eq(offeringSlots.id, input.slotId))
      .for('update')

    if (!slot)
      throw createError({ statusCode: 404, message: 'Time slot not found' })
    if (slot.status !== 'ACTIVE') {
      throw createError({
        statusCode: 400,
        message: 'This session is not active for booking'
      })
    }

    const [offering] = await tx
      .select({
        capacity: offerings.capacity,
        studioId: offerings.studioId,
        categories: offerings.categories,
        currency: studios.currency
      })
      .from(offerings)
      .innerJoin(studios, eq(offerings.studioId, studios.id))
      .where(eq(offerings.id, slot.offeringId))
      .limit(1)
    if (!offering)
      throw createError({ statusCode: 404, message: 'Offering not found' })

    const maxCapacity = slot.capacityOverride ?? offering.capacity
    const [booked] = await tx
      .select({ count: sql<number>`cast(count(${bookings.id}) as int)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.slotId, input.slotId),
          inArray(bookings.status, [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.ATTENDED,
            BookingStatus.NO_SHOW
          ])
        )
      )
    if (
      maxCapacity !== null &&
      maxCapacity !== 0 &&
      Number(booked?.count ?? 0) >= maxCapacity
    ) {
      throw createError({
        statusCode: 400,
        message: 'This class is already fully booked'
      })
    }

    const [duplicate] = await tx
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.slotId, input.slotId),
          eq(bookings.userId, input.userId),
          inArray(bookings.status, [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.ATTENDED,
            BookingStatus.NO_SHOW
          ])
        )
      )
      .limit(1)
    if (duplicate)
      throw createError({
        statusCode: 400,
        message: 'You have already booked this session'
      })

    if (input.userPassId) {
      const now = new Date()
      const [pass] = await tx
        .select({
          id: userPasses.id,
          status: userPasses.status,
          remainingCredits: userPasses.remainingCredits,
          validUntil: userPasses.validUntil
        })
        .from(userPasses)
        .innerJoin(
          pricingOptions,
          eq(userPasses.pricingOptionId, pricingOptions.id)
        )
        .innerJoin(offerings, eq(pricingOptions.studioId, offerings.studioId))
        .where(
          and(
            eq(userPasses.id, input.userPassId),
            eq(userPasses.userId, input.userId),
            eq(userPasses.studioId, offering.studioId),
            eq(pricingOptions.studioId, offering.studioId),
            eq(offerings.id, slot.offeringId),
            or(
              isNull(pricingOptions.offeringId),
              eq(pricingOptions.offeringId, slot.offeringId)
            ),
            or(
              isNull(pricingOptions.applicableCategoryIds),
              sql`cardinality(${pricingOptions.applicableCategoryIds}) = 0`,
              sql`${offerings.categories} && ${pricingOptions.applicableCategoryIds}`
            ),
            eq(userPasses.status, UserPassStatus.ACTIVE),
            lte(userPasses.validFrom, now),
            gte(userPasses.validUntil, now),
            or(
              sql`${userPasses.remainingCredits} > 0`,
              isNull(userPasses.remainingCredits)
            )
          )
        )
        .for('update')
      if (
        !pass ||
        pass.status !== UserPassStatus.ACTIVE ||
        pass.validUntil <= now
      ) {
        throw createError({
          statusCode: 400,
          message: 'Your pass is invalid or expired'
        })
      }
      if (pass.remainingCredits !== null) {
        if (pass.remainingCredits <= 0) {
          throw createError({
            statusCode: 400,
            message: 'Your pass has no remaining credits'
          })
        }
        const remainingCredits = pass.remainingCredits - 1
        await tx
          .update(userPasses)
          .set({
            remainingCredits,
            status:
              remainingCredits === 0
                ? UserPassStatus.EXHAUSTED
                : UserPassStatus.ACTIVE,
            updatedAt: new Date()
          })
          .where(eq(userPasses.id, pass.id))
      }
      const [booking] = await tx
        .insert(bookings)
        .values({
          slotId: slot.id,
          userId: input.userId,
          status: BookingStatus.CONFIRMED,
          userPassId: pass.id
        })
        .returning()
      if (!booking)
        throw createError({
          statusCode: 500,
          message: 'Failed to create booking'
        })
      return { booking, type: 'PASS' as const }
    }

    if (!input.pricingOptionId) {
      throw createError({
        statusCode: 400,
        message: 'Pricing option is required for booking'
      })
    }
    const [pricing] = await tx
      .select({
        id: pricingOptions.id,
        studioId: pricingOptions.studioId,
        name: pricingOptions.name,
        description: pricingOptions.description,
        price: pricingOptions.price,
        type: pricingOptions.type
      })
      .from(pricingOptions)
      .where(
        and(
          eq(pricingOptions.id, input.pricingOptionId),
          eq(pricingOptions.offeringId, slot.offeringId),
          eq(pricingOptions.studioId, offering.studioId),
          eq(pricingOptions.isActive, true)
        )
      )
      .limit(1)
    if (!pricing || pricing.type !== priceOptionsType.DROP_IN) {
      throw createError({
        statusCode: 400,
        message: 'Invalid ticket option selected'
      })
    }

    const mode = input.mode ?? 'CASH'
    const isFree = mode === 'CASH' && pricing.price <= 0
    const [transaction] = await tx
      .insert(transactions)
      .values({
        userId: input.userId,
        studioId: pricing.studioId,
        amount: pricing.price,
        currency: offering.currency,
        provider: isFree
          ? TransactionProvider.FREE
          : mode === 'STRIPE'
            ? TransactionProvider.STRIPE
            : TransactionProvider.CASH,
        status: isFree ? TransactionStatus.SUCCESS : TransactionStatus.PENDING,
        idempotencyKey: input.idempotencyKey ?? null
      })
      .returning()
    if (!transaction)
      throw createError({
        statusCode: 500,
        message: 'Failed to create transaction'
      })

    const [booking] = await tx
      .insert(bookings)
      .values({
        slotId: slot.id,
        userId: input.userId,
        status: isFree ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
        transactionId: transaction.id
      })
      .returning()
    if (!booking)
      throw createError({
        statusCode: 500,
        message: 'Failed to create booking'
      })
    return { booking, transaction, pricing }
  })
}
