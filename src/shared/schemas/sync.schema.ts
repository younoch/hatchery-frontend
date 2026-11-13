import { z } from 'zod'

import { fieldErrorSchema } from '@/shared/api/apiError'

// POST /readings/sync (SyncReadingsResponseDto in openapi.json). A result is matched to the item
// that was sent by `index` (the item's position in the request); `id` is only echoed when the
// item had a string id.
export const syncResultSchema = z.object({
  index: z.number().int().min(0),
  id: z.string().optional(),
  status: z.enum(['created', 'duplicate', 'rejected']),
  identical: z.boolean().optional(), // duplicate only: the stored values equal the sent ones
  errors: z.array(fieldErrorSchema).optional(),
})

export const syncResponseSchema = z.object({
  results: z.array(syncResultSchema),
  totals: z.object({ created: z.number(), duplicate: z.number(), rejected: z.number() }),
})

export type SyncResult = z.infer<typeof syncResultSchema>
export type SyncResponse = z.infer<typeof syncResponseSchema>