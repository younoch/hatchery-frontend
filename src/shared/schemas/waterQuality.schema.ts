import { z } from 'zod'

// Sample physical limits, NOT danger thresholds. Confirm real values with the owner.
export const WATER_RANGES = {
  ph: { min: 0, max: 14 },
  temperatureC: { min: 0, max: 50 },
  salinityPpt: { min: 0, max: 60 },
  oxygenMgL: { min: 0, max: 20 },
} as const

export const NOTE_MAX_LENGTH = 200

// Mirrors the server (openapi.json, COORDINATION B→F-28): it rejects a time more than 10 minutes
// ahead and a time before 2020-01-01 UTC. The frontend is stricter on the future side (5 minutes,
// B→F-09), so a phone clock slightly ahead of the server's does not get readings rejected.
export const RECORDED_AT_MAX_FUTURE_MS = 5 * 60_000
export const RECORDED_AT_MIN_MS = Date.UTC(2020, 0, 1)

// Error messages are i18n keys. Params for t(key, params) come from waterErrorParams.
export const waterErrorParams: Record<string, Record<string, number>> = {
  'validation.ph.outOfRange': WATER_RANGES.ph,
  'validation.temperatureC.outOfRange': WATER_RANGES.temperatureC,
  'validation.salinityPpt.outOfRange': WATER_RANGES.salinityPpt,
  'validation.oxygenMgL.outOfRange': WATER_RANGES.oxygenMgL,
  'validation.note.tooLong': { max: NOTE_MAX_LENGTH },
}

function reading(key: 'ph' | 'temperatureC' | 'salinityPpt' | 'oxygenMgL') {
  const { min, max } = WATER_RANGES[key]
  const outOfRange = `validation.${key}.outOfRange`
  return z
    .number({
      required_error: 'validation.required',
      invalid_type_error: 'validation.number',
    })
    .finite('validation.number')
    .min(min, outOfRange)
    .max(max, outOfRange)
}

export const waterReadingSchema = z.object({
  tankId: z
    .string({ required_error: 'validation.tank.required' })
    .min(1, 'validation.tank.required'),
  recordedAt: z
    .string({ required_error: 'validation.recordedAt.invalid' })
    .superRefine((value, ctx) => {
      const time = Date.parse(value)
      if (Number.isNaN(time)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'validation.recordedAt.invalid' })
      } else if (time > Date.now() + RECORDED_AT_MAX_FUTURE_MS) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'validation.recordedAt.inFuture' })
      } else if (time < RECORDED_AT_MIN_MS) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'validation.recordedAt.tooOld' })
      }
    }),
  ph: reading('ph'),
  temperatureC: reading('temperatureC'),
  salinityPpt: reading('salinityPpt'),
  oxygenMgL: reading('oxygenMgL'),
  note: z.string().trim().max(NOTE_MAX_LENGTH, 'validation.note.tooLong').optional(),
})

export type WaterReadingInput = z.infer<typeof waterReadingSchema>

// Form fields hand over strings (typing) or numbers (stepper); empty means missing.
function toNumber(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed === '' ? undefined : Number(trimmed.replace(',', '.'))
}

export const waterReadingFormSchema = waterReadingSchema.extend({
  ph: z.preprocess(toNumber, waterReadingSchema.shape.ph),
  temperatureC: z.preprocess(toNumber, waterReadingSchema.shape.temperatureC),
  salinityPpt: z.preprocess(toNumber, waterReadingSchema.shape.salinityPpt),
  oxygenMgL: z.preprocess(toNumber, waterReadingSchema.shape.oxygenMgL),
})
