import { z } from 'zod'

// GET /sync/state (SyncStateResponseDto in openapi.json): one opaque change marker per resource.
// A value is an ISO time, or null when nobody has written that resource yet. It is compared for
// "different", never with the phone clock.
export const syncStateSchema = z.object({
  organization: z.string().nullable(),
  tanks: z.string().nullable(),
  organizationRoles: z.string().nullable(),
  readings: z.string().nullable().optional(), // corrections (Step 28)
})

export type SyncState = z.infer<typeof syncStateSchema>
export type MarkerName = 'organization' | 'tanks' | 'organizationRoles' | 'readings'