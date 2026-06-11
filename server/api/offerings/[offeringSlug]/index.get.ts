import { offerings, offeringPractitioners } from '~~/server/db/schema/offering'
import {
	studioLocations,
	studioPractitioners,
	studios,
} from '~~/server/db/schema/studio'
import {
	mediaFiles,
	MediaEntityTypeEnum,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'
import { aliasedTable, and, eq, sql } from 'drizzle-orm'
import { user } from '~~/server/db/schema/auth-schema'

export default defineEventHandler(async (event) => {
	const offeringSlug = getRouterParam(event, 'offeringSlug')

	// Validate required parameters
	if (!offeringSlug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Offering slug is required',
		})
	}

	const db = useDb()
	const studioLogo = aliasedTable(mediaFiles, 'studio_logo')

	try {
		// Verify the offering exists and is published
		const [offering] = await db
			.select({
				id: offerings.id,
				slug: offerings.slug,
				name: offerings.name,
				description: offerings.description,
				activityType: offerings.activityType,
				isPrivate: offerings.isPrivate,
				location: {
					name: studioLocations.name,
					country: studioLocations.country,
					city: studioLocations.city,
					address: studioLocations.address,
				},
				timezone: offerings.timezone,
				duration: offerings.duration,
				capacity: offerings.capacity,
				studio: {
					logo: studioLogo.url,
					name: studios.name,
					slug: studios.slug,
					id: studios.id,
				},
			})
			.from(offerings)
			.where(
				and(eq(offerings.slug, offeringSlug), eq(offerings.isPublished, true)),
			)
			.leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
			.innerJoin(studios, eq(offerings.studioId, studios.id))
			.leftJoin(
				studioLogo,
				and(
					eq(studioLogo.entityId, sql`${studios.id}::text`),
					eq(studioLogo.entityType, MediaEntityTypeEnum.STUDIO),
					eq(studioLogo.type, MediaTypeEnum.LOGO),
				),
			)
			.limit(1)

		if (!offering) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Offering not found',
			})
		}

		// Fetch associated practitioners and gallery media files in parallel
		const [practitionerRows, galleryRows] = await Promise.all([
			db
				.select({ practitionerId: offeringPractitioners.practitionerId })
				.from(offeringPractitioners)
				.where(eq(offeringPractitioners.offeringId, offering.id)),
			db
				.select({
					url: mediaFiles.url,
					providerPublicId: mediaFiles.providerPublicId,
				})
				.from(mediaFiles)
				.where(
					and(
						eq(mediaFiles.entityId, offering.id),
						eq(mediaFiles.entityType, MediaEntityTypeEnum.OFFERING),
						eq(mediaFiles.type, MediaTypeEnum.GALLERY),
					),
				)
				.orderBy(mediaFiles.order),
		])

		const practitionerDetails = await db
			.select({
				id: studioPractitioners.id,
				name: user.name,
				avatar: user.image,
			})
			.from(studioPractitioners)
			.innerJoin(user, eq(studioPractitioners.userId, user.id))
			.where(
				and(
					eq(studioPractitioners.studioId, offering.studio.id),
					eq(studioPractitioners.salaryActive, true),
				),
			)

		return {
			success: true,
			offering: {
				...offering,
				practitioners: practitionerDetails
					.filter((detail) =>
						practitionerRows.some((row) => row.practitionerId === detail.id),
					)
					.map((detail) => {
						return {
							name: detail.name,
							avatar: detail.avatar,
						}
					}),
				gallery: galleryRows.map((r) => r.url),
			},
		}
	} catch (error) {
		if (error && typeof error === 'object' && 'statusCode' in error) {
			throw error
		}
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch offering',
		})
	}
})
