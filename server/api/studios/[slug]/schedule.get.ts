import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { bookings } from '~~/server/db/schema/booking'
import { and, eq, gte, sql } from 'drizzle-orm'
import { BookingStatus } from '~/entities/booking/schema'
import { offeringSlotStatus } from '~/entities/offering/schema'

export default defineEventHandler(async event => {
  const slug = requireRouteParam(event, 'slug')
  const db = useDb()

  const [studio] = await db
    .select({ id: studios.id })
    .from(studios)
    .where(eq(studios.slug, slug))
    .limit(1)

  if (!studio) {
    throwApiError(404, 'Studio not found')
  }

  const slots = await db
    .select({
      id: offeringSlots.id,
      startTime: offeringSlots.startTime,
      endTime: offeringSlots.endTime,
      status: offeringSlots.status,
      capacity: sql<
        number | null
      >`NULLIF(COALESCE(${offeringSlots.capacityOverride}, ${offerings.capacity}), 0)`,
      bookedCount: sql<number>`(
        SELECT count(${bookings.id})::int
        FROM ${bookings}
        WHERE ${bookings.slotId} = ${offeringSlots.id}
        AND ${bookings.status} IN (
          ${BookingStatus.CONFIRMED},
          ${BookingStatus.ATTENDED},
          ${BookingStatus.PENDING},
          ${BookingStatus.NO_SHOW}
        )
      )`,
      offering: {
        id: offerings.id,
        name: offerings.name,
        slug: offerings.slug
      },
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
        eq(offerings.studioId, studio.id),
        eq(offeringSlots.status, offeringSlotStatus.ACTIVE),
        gte(offeringSlots.startTime, new Date())
      )
    )
    .orderBy(offeringSlots.startTime)

  return {
    success: true,
    slots: slots.map(slot => ({
      ...slot,
      availableSpots:
        slot.capacity === null
          ? null
          : Math.max(slot.capacity - slot.bookedCount, 0)
    }))
  }
})
