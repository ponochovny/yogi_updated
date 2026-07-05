import * as z from 'zod'

export const scheduleSchema = z.object({
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid start date'
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid end date'
  }),
  rules: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        practitionerId: z.uuid('Practitioner is required')
      })
    )
    .min(1, { message: 'At least one rule is required' })
})

export type UpdateScheduleInput = z.infer<typeof scheduleSchema>
