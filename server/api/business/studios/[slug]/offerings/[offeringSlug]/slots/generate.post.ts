import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { and, eq } from 'drizzle-orm'
import { parse } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { createSlotSchema } from '~/entities/offering/schema'
import { studios } from '~~/server/db/schema/studio'

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
				'Studio not found or you do not have permission to edit this offering',
		})
	}

	// Verify the offering exists and belongs to the studio
	const [offering] = await db
		.select()
		.from(offerings)
		.where(
			and(eq(offerings.slug, offeringSlug), eq(offerings.studioId, studio.id)),
		)
		.limit(1)
	if (!offering) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Offering not found',
		})
	}

	const body = await readValidatedBody(event, createSlotSchema.parse)

	// Expected structure from the frontend:
	// {
	//   startDate: '2026-06-15',
	//   endDate: '2026-07-15',
	//   rules: [
	//     { dayOfWeek: 1, startTime: '09:00', endTime: '10:30', practitionerId: 'uuid...' }, // Monday
	//     { dayOfWeek: 3, startTime: '09:00', endTime: '10:30', practitionerId: 'uuid...' }  // Wednesday
	//   ]
	// }

	const { startDate, endDate, rules } = body

	try {
		const timeZone = offering.timezone || 'UTC' // Default to UTC if not set, but ideally should be required or inherited from studio
		const slotsToInsert = []

		// Parse dates (in UTC, to avoid offsets from the local server)
		const currentDate = new Date(startDate)
		const end = new Date(endDate)

		// 2. Loop through all days from startDate to endDate
		while (currentDate <= end) {
			// getUTCDay() returns the day of the week: 0 (Sun) - 6 (Sat)
			const currentDayOfWeek = currentDate.getUTCDay()

			// Check if there is a rule for this day of the week
			const matchingRules = rules.filter(
				(r) => r.dayOfWeek === currentDayOfWeek,
			)

			for (const rule of matchingRules) {
				// Formulate string dates with timezone consideration
				// Using YYYY-MM-DD format
				const dateString = currentDate.toISOString().split('T')[0]

				// Timezone magic: we tell the JS engine to create a date, explicitly specifying the studio's timezone
				// Format: "2026-06-15T09:00:00" in the correct zone.
				// For MVP we use a reliable hack through Intl or keep the local time,
				// but it's better to form an ISO string that Drizzle will write correctly.

				const startString = `${dateString} ${rule.startTime}` // e.g., '2026-06-15 09:00'
				const endString = `${dateString} ${rule.endTime}` // e.g., '2026-06-15 10:30'

				// Parse strings to Date objects assuming they are in the studio's local timezone
				const localStart = parse(startString, 'yyyy-MM-dd HH:mm', new Date())
				const localEnd = parse(endString, 'yyyy-MM-dd HH:mm', new Date())

				// Convert the local time to pure UTC for database storage
				const utcStart = fromZonedTime(localStart, timeZone)
				const utcEnd = fromZonedTime(localEnd, timeZone)

				slotsToInsert.push({
					offeringId: offering.id,
					practitionerId: rule.practitionerId,
					startTime: utcStart,
					endTime: utcEnd,
					status: 'ACTIVE',
				})
			}

			// Move to the next day
			currentDate.setUTCDate(currentDate.getUTCDate() + 1)
		}

		if (slotsToInsert.length === 0) {
			return {
				success: false,
				message:
					'In the selected range, there are no matches by days of the week',
			}
		}

		// 3. Batch Insert - very fast in Drizzle
		await db.insert(offeringSlots).values(slotsToInsert)

		return {
			success: true,
			message: `Successfully generated ${slotsToInsert.length} slots`,
			count: slotsToInsert.length,
		}
	} catch (error) {
		console.log('Generate slots error:', error)
		throw createError({
			statusCode: 500,
			statusMessage: (error as Error).message,
		})
	}
})
