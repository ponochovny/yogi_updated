import {
	globalCategories,
	globalCurrencies,
	globalTypes,
} from '../db/schema/global'
import { throwApiError } from '../utils/api-helpers'

export default defineEventHandler(async () => {
	const db = useDb()

	try {
		const categories = await db
			.select({
				id: globalCategories.id,
				name: globalCategories.name,
				slug: globalCategories.slug,
			})
			.from(globalCategories)

		const types = await db
			.select({
				id: globalTypes.id,
				name: globalTypes.name,
				slug: globalTypes.slug,
			})
			.from(globalTypes)

		const currencies = await db
			.select({
				id: globalCurrencies.id,
				name: globalCurrencies.name,
				slug: globalCurrencies.slug,
			})
			.from(globalCurrencies)

		return { success: true, params: { categories, types, currencies } }
	} catch (error) {
		if (isApiError(error)) throw error
		console.error('Failed to fetch params', error)
		throwApiError(500, 'Failed to fetch params')
	}
})
