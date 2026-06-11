import * as z from 'zod'
import { offeringSlotStatus } from '../offering/schema'

export const updateSlotsSchema = z.object({
	id: z.uuid(),
	practitionerId: z.string(),
	status: z.enum([
		offeringSlotStatus.ACTIVE,
		offeringSlotStatus.COMPLETED,
		offeringSlotStatus.CANCELLED,
	]),
})

export type updateSlotsSchemaInput = z.infer<typeof updateSlotsSchema>
