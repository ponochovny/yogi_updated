import { and, eq, sql } from 'drizzle-orm'
import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS,
    userRoles.MANAGER
  ])
  const rows = await useDb()
    .select({
      id: offeringSlots.id,
      offeringId: offerings.id,
      offeringName: offerings.name,
      practitionerId: studioPractitioners.id,
      practitionerName: user.name,
      startTime: offeringSlots.startTime,
      endTime: offeringSlots.endTime,
      capacity: sql<number>`COALESCE(${offeringSlots.capacityOverride}, ${offerings.capacity}, 0)`,
      bookedCount: sql<number>`(SELECT count(*)::int FROM ${bookings} WHERE ${bookings.slotId} = ${offeringSlots.id} AND ${bookings.status} <> 'CANCELLED')`
    })
    .from(offeringSlots)
    .innerJoin(offerings, eq(offerings.id, offeringSlots.offeringId))
    .innerJoin(
      studioPractitioners,
      eq(studioPractitioners.id, offeringSlots.practitionerId)
    )
    .innerJoin(user, eq(user.id, studioPractitioners.userId))
    .where(
      and(
        eq(offerings.studioId, access.studioId),
        eq(studioPractitioners.studioId, access.studioId)
      )
    )
    .orderBy(offeringSlots.startTime)
  return rows
})
