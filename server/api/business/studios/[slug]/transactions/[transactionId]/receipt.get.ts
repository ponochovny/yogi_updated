import { and, eq } from 'drizzle-orm'
import { transactions } from '~~/server/db/schema/payment'
import { studios } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { userRoles } from '~~/server/auth/config'

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const transactionId = requireRouteParam(event, 'transactionId')
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS
  ])
  const [transaction] = await useDb()
    .select({
      id: transactions.id,
      amount: transactions.amount,
      currency: transactions.currency,
      provider: transactions.provider,
      providerTransactionId: transactions.providerTransactionId,
      status: transactions.status,
      createdAt: transactions.createdAt,
      studioName: studios.name,
      customerName: user.name,
      customerEmail: user.email
    })
    .from(transactions)
    .innerJoin(studios, eq(transactions.studioId, studios.id))
    .innerJoin(user, eq(transactions.userId, user.id))
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.studioId, access.studioId)
      )
    )
    .limit(1)

  if (!transaction) throwApiError(404, 'Transaction not found')
  if (transaction.status !== 'SUCCESS')
    throwApiError(400, 'A receipt is available after the payment is completed')

  const amount = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: transaction.currency
  }).format(transaction.amount / 100)
  const date = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(transaction.createdAt))
  const receipt = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Receipt ${escapeHtml(transaction.id)}</title><style>body{font:16px system-ui,sans-serif;max-width:560px;margin:48px auto;padding:0 24px;color:#292524}h1{font-size:28px}dl{border-top:1px solid #ddd}dt,dd{padding:12px 0;border-bottom:1px solid #ddd}dt{float:left;color:#78716c}dd{text-align:right;margin:0;font-weight:600}.total{font-size:20px}</style></head><body><h1>Payment receipt</h1><dl><dt>Studio</dt><dd>${escapeHtml(transaction.studioName)}</dd><dt>Customer</dt><dd>${escapeHtml(transaction.customerName)} (${escapeHtml(transaction.customerEmail)})</dd><dt>Date</dt><dd>${escapeHtml(date)}</dd><dt>Payment method</dt><dd>${escapeHtml(transaction.provider)}</dd><dt>Transaction ID</dt><dd>${escapeHtml(transaction.providerTransactionId || transaction.id)}</dd><dt class="total">Total</dt><dd class="total">${escapeHtml(amount)}</dd></dl></body></html>`
  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="receipt-${transaction.id}.html"`
  )
  return receipt
})
