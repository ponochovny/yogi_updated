import * as z from 'zod'

export const scheduleSchema = z
  .object({
    startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid start date'
    }),
    endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid end date'
    }),
    rules: z
      .array(
        z
          .object({
            dayOfWeek: z.number().min(0).max(6),
            startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
            endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
            practitionerId: z.uuid('Practitioner is required')
          })
          .refine(r => r.startTime < r.endTime, {
            message: 'Start time must be before end time',
            path: ['endTime']
          })
      )
      .min(1, { message: 'At least one rule is required' })
  })
  .refine(v => new Date(v.endDate) >= new Date(v.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate']
  })

export type UpdateScheduleInput = z.infer<typeof scheduleSchema>
