import { and, eq, gte, inArray, lt, sql } from 'drizzle-orm'
import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { transactions } from '~~/server/db/schema/payment'
import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { BookingStatus } from '~/entities/booking/schema'
import { calculateClassPayout } from '~~/server/utils/practitioner-earnings'
import { z } from 'zod'

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const db = useDb()
  const query = getQuery(event)
  const requestedMonth =
    query.month === undefined
      ? new Date().toISOString().slice(0, 7)
      : query.month
  const parsedMonth = monthSchema.safeParse(requestedMonth)
  if (!parsedMonth.success) throwApiError(400, 'Invalid month')
  const month = parsedMonth.data

  const start = new Date(`${month}-01T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + 1)

  const practitioner = await db
    .select({
      id: studioPractitioners.id,
      compensationType: studioPractitioners.compensationType,
      compensationRate: studioPractitioners.compensationRate,
      studioId: studioPractitioners.studioId
    })
    .from(studioPractitioners)
    .where(eq(studioPractitioners.userId, userData.id))

  if (!practitioner.length) {
    return {
      month,
      rows: [],
      total: 0,
      currency: 'USD'
    }
  }

  const rows = await db
    .select({
      id: offeringSlots.id,
      practitionerId: offeringSlots.practitionerId,
      startTime: offeringSlots.startTime,
      endTime: offeringSlots.endTime,
      studio: {
        id: studios.id,
        name: studios.name,
        slug: studios.slug
      },
      offering: {
        id: offerings.id,
        name: offerings.name,
        slug: offerings.slug
      },
      attendedCount: sql<number>`count(${bookings.id}) filter (where ${bookings.status} = ${BookingStatus.ATTENDED})`,
      noShowCount: sql<number>`count(${bookings.id}) filter (where ${bookings.status} = ${BookingStatus.NO_SHOW})`,
      revenueCents: sql<number>`coalesce(sum(${transactions.amount}) filter (where ${transactions.status} = 'SUCCESS' and ${inArray(bookings.status, [BookingStatus.ATTENDED, BookingStatus.CONFIRMED])}), 0)`,
      payoutCents: sql<number>`0`
    })
    .from(offeringSlots)
    .innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
    .innerJoin(studios, eq(offerings.studioId, studios.id))
    .leftJoin(bookings, eq(bookings.slotId, offeringSlots.id))
    .leftJoin(transactions, eq(transactions.id, bookings.transactionId))
    .where(
      and(
        inArray(
          offeringSlots.practitionerId,
          practitioner.map(record => record.id)
        ),
        gte(offeringSlots.startTime, start),
        lt(offeringSlots.startTime, end)
      )
    )
    .groupBy(
      offeringSlots.id,
      offeringSlots.practitionerId,
      offerings.id,
      studios.id
    )
    .orderBy(offeringSlots.startTime)

  const practitionersById = new Map(
    practitioner.map(record => [record.id, record])
  )

  const withPayout = rows.map(row => {
    const practitionerRecord = practitionersById.get(row.practitionerId)
    const { practitionerId, ...rowData } = row
    const payoutCents = calculateClassPayout({
      compensationType: practitionerRecord?.compensationType || '',
      compensationRate: practitionerRecord?.compensationRate || '',
      attendedCount: Number(row.attendedCount || 0),
      revenueCents: Number(row.revenueCents || 0)
    })

    return {
      ...rowData,
      payoutCents,
      payout: payoutCents / 100,
      attendedCount: Number(row.attendedCount || 0),
      noShowCount: Number(row.noShowCount || 0),
      revenueCents: Number(row.revenueCents || 0),
      revenue: Number(row.revenueCents || 0) / 100
    }
  })

  const total = withPayout.reduce((sum, row) => sum + row.payoutCents, 0)

  return {
    month,
    rows: withPayout,
    total,
    currency: 'USD'
  }
})
