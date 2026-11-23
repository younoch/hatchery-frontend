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
  updatedAt: z.string().optional(),
  editableUntil: z.string().nullable().optional(),
})

export const readingListSchema = z.object({
  items: z.array(readingItemSchema),
  nextCursor: z.string().nullable(), // null on the last page
})

export type ReadingItem = z.infer<typeof readingItemSchema>

// The organization's readings (`GET /readings/organization`): the same reading plus who recorded it.
export const readingAuthorSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullable(),
})

export const orgReadingSchema = readingItemSchema.extend({ createdBy: readingAuthorSchema })

export const orgReadingListSchema = z.object({
  items: z.array(orgReadingSchema),
  nextCursor: z.string().nullable(),
})

// `GET /readings/organization/latest`: the newest reading of each tank that has one, in no order.
export const orgLatestSchema = z.object({ items: z.array(orgReadingSchema) })

export type OrgReading = z.infer<typeof orgReadingSchema>
