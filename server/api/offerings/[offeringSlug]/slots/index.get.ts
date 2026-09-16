import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { bookings } from '~~/server/db/schema/booking'
import { user } from '~~/server/db/schema/auth-schema'
import { studioPractitioners } from '~~/server/db/schema/studio'
import { and, eq, gte, sql } from 'drizzle-orm'
import { BookingStatus } from '~/entities/booking/schema'
import { offeringSlotStatus } from '~/entities/offering/schema'

export default defineEventHandler(async event => {
  const offeringSlug = requireRouteParam(event, 'offeringSlug')

  const db = useDb()

  // 1. Find the offering by slug
  const [offering] = await db
    .select({ id: offerings.id })
    .from(offerings)
    .where(
      and(eq(offerings.slug, offeringSlug), eq(offerings.isPublished, true))
    )
    .limit(1)
  if (!offering) throwApiError(404, 'Offering not found')

  try {
    // 2. Fetch slots with coach info
    const slots = await db
      .select({
        id: offeringSlots.id,
        startTime: offeringSlots.startTime,
        endTime: offeringSlots.endTime,
        status: offeringSlots.status,
        availableSpots: sql<number | null>`CASE
          WHEN COALESCE(${offeringSlots.capacityOverride}, ${offerings.capacity}) IS NULL THEN NULL
          ELSE GREATEST(
            COALESCE(${offeringSlots.capacityOverride}, ${offerings.capacity}) - (
              SELECT count(*)::int
              FROM ${bookings}
              WHERE ${bookings.slotId} = ${offeringSlots.id}
                AND ${bookings.status} IN (
                  ${BookingStatus.CONFIRMED},
                  ${BookingStatus.ATTENDED},
                  ${BookingStatus.NO_SHOW},
                  ${BookingStatus.PENDING}
                )
            ),
            0
          )
        END`,
        practitioner: {
          id: studioPractitioners.id,
          name: user.name
        }
      })
      .from(offeringSlots)
      .innerJoin(
        studioPractitioners,
        eq(offeringSlots.practitionerId, studioPractitioners.id)
      )
      .innerJoin(user, eq(studioPractitioners.userId, user.id))
      .innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
      .where(
        and(
          eq(offeringSlots.offeringId, offering.id),
          eq(offeringSlots.status, offeringSlotStatus.ACTIVE),
          gte(offeringSlots.startTime, new Date())
        )
      )
      .orderBy(offeringSlots.startTime)

    return { success: true, slots }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch offering slots', error)
    throwApiError(500, 'Failed to fetch offering slots')
  }
})
