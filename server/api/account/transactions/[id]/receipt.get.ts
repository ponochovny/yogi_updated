import { eq } from 'drizzle-orm'
import { transactions } from '~~/server/db/schema/payment'
import { studios } from '~~/server/db/schema/studio'

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  const transactionId = requireRouteParam(event, 'id')
  const db = useDb()

  const [transaction] = await db
    .select({
      id: transactions.id,
      userId: transactions.userId,
      amount: transactions.amount,
      currency: transactions.currency,
      provider: transactions.provider,
      providerTransactionId: transactions.providerTransactionId,
      status: transactions.status,
      createdAt: transactions.createdAt,
      studioName: studios.name
    })
    .from(transactions)
    .innerJoin(studios, eq(transactions.studioId, studios.id))
    .where(eq(transactions.id, transactionId))
    .limit(1)

  if (!transaction || transaction.userId !== user.id) {
    throwApiError(404, 'Transaction not found')
  }

  if (transaction.status !== 'SUCCESS') {
    throwApiError(400, 'A receipt is available after the payment is completed')
  }

  const amount = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: transaction.currency
  }).format(transaction.amount / 100)
  const date = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(transaction.createdAt))

  const receipt = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Receipt ${escapeHtml(transaction.id)}</title>
    <style>body{font:16px system-ui,sans-serif;max-width:560px;margin:48px auto;padding:0 24px;color:#292524}h1{font-size:28px}dl{border-top:1px solid #ddd}dt,dd{padding:12px 0;border-bottom:1px solid #ddd}dt{float:left;color:#78716c}dd{text-align:right;margin:0;font-weight:600}.total{font-size:20px}</style>
  </head>
  <body>
    <h1>Payment receipt</h1>
    <p>Thank you for your payment.</p>
    <dl>
      <dt>Studio</dt><dd>${escapeHtml(transaction.studioName)}</dd>
      <dt>Date</dt><dd>${escapeHtml(date)}</dd>
      <dt>Payment method</dt><dd>${escapeHtml(transaction.provider)}</dd>
      <dt>Transaction ID</dt><dd>${escapeHtml(transaction.providerTransactionId || transaction.id)}</dd>
      <dt class="total">Total</dt><dd class="total">${escapeHtml(amount)}</dd>
    </dl>
  </body>
</html>`

  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="receipt-${transaction.id}.html"`
  )
  return receipt
})
