import { studios, studioLocations } from '~~/server/db/schema/studio'
import { mediaFiles, MediaTypeEnum } from '~~/server/db/schema/_other'
import { and, eq, inArray } from 'drizzle-orm'
import { useDb } from '~~/server/utils/db'
import { userRoles } from '~~/server/auth/config'
import {
	globalCategories,
	globalCurrencies,
	globalTypes,
} from '~~/server/db/schema/global'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const currentUserId = userData.id
	const db = useDb()

	const access = await checkStudioAccess(currentUserId, slug, [
		userRoles.BUSINESS,
		userRoles.MANAGER,
		userRoles.PRACTITIONER,
	])

	const [studio] = await db
		.select()
		.from(studios)
		.where(eq(studios.id, access.studioId))
		.limit(1)
	if (!studio) {
		throwApiError(
			404,
			'Studio not found or you do not have permission to view it',
		)
	}

	try {
		const [locations, media, categoriesData, typesData, currenciesData] =
			await Promise.all([
				db
					.select()
					.from(studioLocations)
					.where(eq(studioLocations.studioId, studio.id)),
				db
					.select()
					.from(mediaFiles)
					.where(
						and(
							eq(mediaFiles.entityId, studio.id),
							eq(mediaFiles.entityType, 'STUDIO'),
						),
					)
					.orderBy(mediaFiles.order),
				db
					.select({ name: globalCategories.name })
					.from(globalCategories)
					.where(inArray(globalCategories.id, studio.categories || [])),
				db
					.select({ name: globalTypes.name })
					.from(globalTypes)
					.where(inArray(globalTypes.id, studio.types || [])),
				db
					.select({ name: globalCurrencies.name })
					.from(globalCurrencies)
					.where(eq(globalCurrencies.id, studio.currency)),
			])

		const logo = media.find((file) => file.type === MediaTypeEnum.LOGO) || null
		const gallery = media.filter((file) => file.type === MediaTypeEnum.GALLERY)
		const categoryNames = categoriesData.map((c) => c.name)
		const typeNames = typesData.map((c) => c.name)
		const currencyName = currenciesData[0]?.name

		return {
			success: true,
			studio: {
				...studio,
				locations,
				logo: logo
					? {
							url: logo.url,
							// providerPublicId: logo.providerPublicId
						}
					: null,
				gallery: gallery.map((file) => ({
					url: file.url,
					// providerPublicId: file.providerPublicId,
				})),
				categories: categoryNames,
				types: typeNames,
				currency: currencyName,
			},
		}
	} catch (error) {
		if (isApiError(error)) throw error
		console.error('Failed to fetch studio details', error)
		throwApiError(500, 'Failed to fetch studio details')
	}
})
