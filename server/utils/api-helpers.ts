import { createError, type H3Event } from 'h3'
import { auth } from '~~/server/utils/auth'

export function throwApiError(
	statusCode: number,
	message: string,
	data?: unknown,
): never {
	throw createError({
		statusCode,
		statusMessage: message,
		data,
	})
}

export function isApiError(error: unknown): error is { statusCode: number } {
	return (
		typeof error === 'object' &&
		error !== null &&
		'statusCode' in error &&
		typeof (error as { statusCode?: unknown }).statusCode === 'number'
	)
}

export function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : String(error)
}

export async function requireAuthenticatedUser(event: H3Event) {
	const session = await auth.api.getSession({ headers: event.headers })
	if (!session?.user) {
		throwApiError(401, 'Unauthorized access')
	}
	return session.user
}

export function requireRouteParam(event: H3Event, name: string) {
	const value = getRouterParam(event, name)
	if (!value) {
		throwApiError(400, `${name} is required`)
	}
	return value
}

// USAGE EXAMPLE:
// export default defineEventHandler(async (event) => {
//   try {
//     const userData = await requireAuthenticatedUser(event)
//     const slug = requireRouteParam(event, 'slug')
//     const offeringSlug = requireRouteParam(event, 'offeringSlug')
//			throwApiError(404, 'Offering not found in this studio')
//     // ... other logic
//   } catch (error: unknown) {
// if (isApiError(error)) throw error
// console.error('Failed to fetch studios', error)
// throwApiError(500, 'Failed to fetch studios')
//   }
// })
