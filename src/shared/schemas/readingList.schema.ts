import { z } from 'zod'

// GET /readings (ReadingListResponseDto in openapi.json): the signed-in user's own readings.
export const readingItemSchema = z.object({
  id: z.string(),
  tankId: z.string(),
  recordedAt: z.string(),
  ph: z.number(),
  temperatureC: z.number(),
  salinityPpt: z.number(),
  oxygenMgL: z.number(),
  note: z.string().nullable(),
  syncedAt: z.string(),
})

export const readingListSchema = z.object({
  items: z.array(readingItemSchema),
  nextCursor: z.string().nullable(), // null on the last page
})

export type ReadingItem = z.infer<typeof readingItemSchema>