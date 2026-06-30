import { eq } from 'drizzle-orm'
import { userRoles } from '~~/server/auth/config'
import { transactions, TransactionStatus } from '~~/server/db/schema/payment'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({ headers: event.headers })
	if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

	const db = useDb()
	const transactionId = requireRouteParam(event, 'id')

	const [transaction] = await db
		.select()
		.from(transactions)
		.where(eq(transactions.id, transactionId))
		.limit(1)

	if (!transaction) throwApiError(400, 'Transaction not found')

	await checkStudioAccess(session.user.id, transaction.studioId, [
		userRoles.BUSINESS,
		userRoles.MANAGER,
		userRoles.PRACTITIONER,
	])

	if (
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
			transactionId,
		)
	) {
		throwApiError(400, 'Invalid transaction id')
	}

	const [updatedTransaction] = await db
		.update(transactions)
		.set({
			status: TransactionStatus.SUCCESS,
			updatedAt: new Date(),
		})
		.where(eq(transactions.id, transactionId))
		.returning()

	if (!updatedTransaction) throwApiError(400, 'Transaction not found')

	return { success: true, message: 'Payment confirmed' }
})
