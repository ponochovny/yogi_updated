import * as z from 'zod'
import { updatableBookingStatuses } from '../booking/schema'

export const updateSlotsSchema = z.object({
  id: z.uuid(),
  practitionerId: z.string(),
  status: z.enum(updatableBookingStatuses),
  capacityOverride: z.number().int().nullable().optional()
})

export type updateSlotsSchemaInput = z.infer<typeof updateSlotsSchema>
