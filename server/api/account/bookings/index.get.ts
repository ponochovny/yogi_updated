import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { bookings } from '~~/server/db/schema/booking'
import {
	studios,
	studioPractitioners,
	studioLocations,
} from '~~/server/db/schema/studio'
import { user as usersTable } from '~~/server/db/schema/auth-schema'
import { eq, desc, and, sql, asc } from 'drizzle-orm'
import {
	MediaEntityTypeEnum,
	mediaFiles,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'

export default defineEventHandler(async (event) => {
	const user = await requireAuthenticatedUser(event)

	const userId = user.id
	const db = useDb()

	const firstOfferingMedia = db
		.selectDistinctOn([mediaFiles.entityId], {
			entityId: mediaFiles.entityId,
			url: mediaFiles.url,
		})
		.from(mediaFiles)
		.where(
			and(
				eq(mediaFiles.entityType, MediaEntityTypeEnum.OFFERING),
				eq(mediaFiles.type, MediaTypeEnum.GALLERY),
			),
		)
		.orderBy(mediaFiles.entityId, asc(mediaFiles.order))
		.as('first_offering_media')

	const practitionerAvatar = db
		.selectDistinctOn([mediaFiles.entityId], {
			entityId: mediaFiles.entityId,
			url: mediaFiles.url,
		})
		.from(mediaFiles)
		.where(
			and(
				eq(mediaFiles.entityType, MediaEntityTypeEnum.USER),
				eq(mediaFiles.type, MediaTypeEnum.AVATAR),
			),
		)
		.as('practitioner_avatar')

	try {
		const userBookings = await db
			.select({
				id: bookings.id,
				status: bookings.status,
				createdAt: bookings.createdAt,
				updatedAt: bookings.updatedAt,
				slot: {
					id: offeringSlots.id,
					startTime: offeringSlots.startTime,
					endTime: offeringSlots.endTime,
				},
				offering: {
					name: offerings.name,
					slug: offerings.slug,
					duration: offerings.duration,
					coverImage: firstOfferingMedia.url,
				},
				studio: {
					name: studios.name,
					slug: studios.slug,
					address: studioLocations.address, // Include address for more context in the account page
				},
				practitioner: {
					name: usersTable.name,
					// slug: studioPractitioners.slug,
					avatar: practitionerAvatar.url,
				},
			})
			.from(bookings)
			.innerJoin(offeringSlots, eq(bookings.slotId, offeringSlots.id))
			.innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
			.innerJoin(studios, eq(offerings.studioId, studios.id))
			.leftJoin(
				studioPractitioners,
				eq(offeringSlots.practitionerId, studioPractitioners.id),
			)
			.leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
			.leftJoin(usersTable, eq(studioPractitioners.userId, usersTable.id))
			.leftJoin(
				firstOfferingMedia,
				eq(sql`${offerings.id}::text`, firstOfferingMedia.entityId),
			)
			.leftJoin(
				practitionerAvatar,
				eq(
					sql`${studioPractitioners.userId}::text`,
					practitionerAvatar.entityId,
				),
			)
			.where(eq(bookings.userId, userId))
			.orderBy(desc(offeringSlots.startTime))

		return { success: true, bookings: userBookings }
	} catch (error) {
		if (isApiError(error)) throw error
		console.error('Failed to fetch bookings', error)
		throwApiError(500, 'Failed to fetch bookings')
	}
})
