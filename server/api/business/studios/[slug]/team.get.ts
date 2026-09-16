import { and, eq, gte, lt, sql } from 'drizzle-orm'
import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots } from '~~/server/db/schema/offering'
import { studioPractitioners } from '~~/server/db/schema/studio'
import { transactions } from '~~/server/db/schema/payment'
import { user } from '~~/server/db/schema/auth-schema'
import { userRoles } from '~~/server/auth/config'
import { BookingStatus } from '~/entities/booking/schema'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const month = String(
    getQuery(event).month || new Date().toISOString().slice(0, 7)
  )
  const start = new Date(`${month}-01T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + 1)
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS
  ])
  const db = useDb()
  const [members, payroll] = await Promise.all([
    db
      .select({
        linkId: studioPractitioners.id,
        role: studioPractitioners.role,
        isActive: studioPractitioners.isActive,
        compensationType: studioPractitioners.compensationType,
        compensationRate: studioPractitioners.compensationRate,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified
        }
      })
      .from(studioPractitioners)
      .innerJoin(user, eq(user.id, studioPractitioners.userId))
      .where(eq(studioPractitioners.studioId, access.studioId)),
    db
      .select({
        practitionerId: studioPractitioners.id,
        name: user.name,
        compensationType: studioPractitioners.compensationType,
        compensationRate: studioPractitioners.compensationRate,
        attended: sql<number>`count(*) filter (where ${bookings.status} = ${BookingStatus.ATTENDED})`,
        revenue: sql<number>`coalesce(sum(${transactions.amount}) filter (where ${transactions.status} = 'SUCCESS'), 0)`
      })
      .from(studioPractitioners)
      .innerJoin(user, eq(user.id, studioPractitioners.userId))
      .leftJoin(
        offeringSlots,
        eq(offeringSlots.practitionerId, studioPractitioners.id)
      )
      .leftJoin(bookings, eq(bookings.slotId, offeringSlots.id))
      .leftJoin(transactions, eq(transactions.id, bookings.transactionId))
      .where(
        and(
          eq(studioPractitioners.studioId, access.studioId),
          gte(offeringSlots.startTime, start),
          lt(offeringSlots.startTime, end)
        )
      )
      .groupBy(studioPractitioners.id, user.name)
  ])
  return {
    month,
    members,
    payroll: payroll.map(row => ({
      ...row,
      amount:
        row.compensationType === 'PER_ATTENDEE'
          ? Number(row.attended) * row.compensationRate
          : row.compensationType === 'REVENUE_SHARE'
            ? Math.round((Number(row.revenue) * row.compensationRate) / 10000)
            : Number(row.attended) * row.compensationRate
    }))
  }
})
