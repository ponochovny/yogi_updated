import { and, eq, gte, inArray } from 'drizzle-orm'
import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import { transactions, TransactionStatus } from '~~/server/db/schema/payment'
import { globalCurrencies } from '~~/server/db/schema/global'
import { BookingStatus } from '~/entities/booking/schema'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS
  ])
  const db = useDb()
  const [studio] = await db
    .select()
    .from(studios)
    .where(eq(studios.id, access.studioId))
    .limit(1)
  if (!studio) throwApiError(404, 'Studio not found')

  const since = new Date()
  since.setDate(since.getDate() - 29)
  since.setHours(0, 0, 0, 0)

  const [currency, sales, slotRows] = await Promise.all([
    db
      .select({ name: globalCurrencies.name })
      .from(globalCurrencies)
      .where(eq(globalCurrencies.id, studio.currency))
      .limit(1),
    db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.studioId, studio.id),
          gte(transactions.createdAt, since)
        )
      ),
    db
      .select({ slot: offeringSlots, offering: offerings })
      .from(offeringSlots)
      .innerJoin(offerings, eq(offerings.id, offeringSlots.offeringId))
      .where(eq(offerings.studioId, studio.id))
  ])

  const slotIds = slotRows.map(row => row.slot.id)
  const bookingRows = slotIds.length
    ? await db.select().from(bookings).where(inArray(bookings.slotId, slotIds))
    : []
  const realized = sales.filter(
    sale => sale.status === TransactionStatus.SUCCESS
  )
  const pending = sales.filter(
    sale =>
      sale.provider === 'CASH' && sale.status === TransactionStatus.PENDING
  )
  const attended = bookingRows.filter(
    booking => booking.status === BookingStatus.ATTENDED
  ).length
  const noShow = bookingRows.filter(
    booking => booking.status === BookingStatus.NO_SHOW
  ).length
  const capacity = slotRows.reduce(
    (total, row) =>
      total + (row.slot.capacityOverride ?? row.offering.capacity ?? 0),
    0
  )
  const booked = bookingRows.filter(
    booking => booking.status !== BookingStatus.CANCELLED
  ).length
  const chart = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(since)
    date.setDate(since.getDate() + index)
    const key = date.toISOString().slice(0, 10)
    return {
      date: key,
      amount: realized
        .filter(sale => sale.createdAt.toISOString().slice(0, 10) === key)
        .reduce((sum, sale) => sum + sale.amount, 0)
    }
  })

  return {
    currency: currency[0]?.name || null,
    kpis: {
      realizedRevenue: realized.reduce((sum, sale) => sum + sale.amount, 0),
      pendingReceivables: pending.reduce((sum, sale) => sum + sale.amount, 0),
      occupancyRate: capacity ? Math.round((booked / capacity) * 100) : 0
    },
    salesByDay: chart,
    attendance: { attended, noShow }
  }
})
