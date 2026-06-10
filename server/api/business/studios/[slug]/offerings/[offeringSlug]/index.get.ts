import { offerings, offeringPractitioners } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import {
	mediaFiles,
	MediaEntityTypeEnum,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'
import { aliasedTable, and, eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({
		headers: event.headers,
	})

	// Check for authenticated user
	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized access',
		})
	}

	const slug = getRouterParam(event, 'slug')
	const offeringSlug = getRouterParam(event, 'offeringSlug')

	// Validate required parameters
	if (!slug || !offeringSlug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Studio slug and offering slug are required',
		})
	}

	const currentUserId = session.user.id
	const db = useDb()
	const studioLogo = aliasedTable(mediaFiles, 'studio_logo')

	// Verify the studio exists and belongs to the current user
	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)
	if (!studio) {
		throw createError({
			statusCode: 404,
			statusMessage:
				'Studio not found or you do not have permission to view it',
		})
	}

	// Verify the offering exists and belongs to the studio
	const [offering] = await db
		.select({
			id: offerings.id,
			slug: offerings.slug,
			name: offerings.name,
			description: offerings.description,
			activityType: offerings.activityType,
			isPrivate: offerings.isPrivate,
			locationId: offerings.locationId,
			timezone: offerings.timezone,
			duration: offerings.duration,
			capacity: offerings.capacity,
			studio: {
				logo: studioLogo.url,
				name: studios.name,
				slug: studios.slug,
			},
		})
		.from(offerings)
		.where(
			and(eq(offerings.slug, offeringSlug), eq(offerings.studioId, studio.id)),
		)
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

	return {
		success: true,
		offering: {
			...offering,
			practitionerIds: practitionerRows.map((row) => row.practitionerId),
			gallery: galleryRows,
		},
	}
})
