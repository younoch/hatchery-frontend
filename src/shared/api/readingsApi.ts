import { authedRequest } from '@/shared/api/authedRequest'
import {
  orgLatestSchema,
  orgReadingListSchema,
  readingItemSchema,
  readingListSchema,
} from '@/shared/schemas/readingList.schema'

const PAGE_SIZE = 100

// One page of the signed-in user's own readings, newest first. The same `from` must be sent with
// every cursor.
export function fetchReadingsPage(options: { from: string; cursor?: string }) {
  const query = new URLSearchParams({ from: options.from, limit: String(PAGE_SIZE) })
  if (options.cursor) query.set('cursor', options.cursor)
  return authedRequest({ path: `/readings?${query.toString()}`, schema: readingListSchema })
}

// One page of the organization's readings of a tank, oldest first (a chart wants that). Needs
// `reading:read-all`. The same filters must be sent with every cursor.
export function fetchOrganizationReadingsPage(options: {
  tankId: string
  from: Date
  to: Date
  cursor?: string
}) {
  const query = new URLSearchParams({
    tankId: options.tankId,
    from: options.from.toISOString(),
    to: options.to.toISOString(),
    order: 'asc',
    limit: '500',
  })
  if (options.cursor) query.set('cursor', options.cursor)
  return authedRequest({
    path: `/readings/organization?${query.toString()}`,
    schema: orgReadingListSchema,
  })
}

// The newest reading of each tank that has one.
export function fetchOrganizationLatest() {
  return authedRequest({ path: '/readings/organization/latest', schema: orgLatestSchema })
}


// One of the signed-in user's own readings, as the server holds it now.
export function getReading(id: string) {
  return authedRequest({ path: `/readings/${id}`, schema: readingItemSchema })
}

// The fields of a reading that can be corrected (at least one is needed).
export interface ReadingChanges {
  tankId?: string
  recordedAt?: string
  ph?: number
  temperatureC?: number
  salinityPpt?: number
  oxygenMgL?: number
  note?: string | null
}

// Corrects an own reading inside its window. `expectedUpdatedAt` is the `updatedAt` the phone
// holds: another value on the server answers 409 `stale_reading`.
export function patchReading(id: string, expectedUpdatedAt: string, changes: ReadingChanges) {
  return authedRequest({
    method: 'PATCH',
    path: `/readings/${id}`,
    body: { expectedUpdatedAt, ...changes },
    schema: readingItemSchema,
  })
}

// Deletes an own reading inside its window. The server answers the same when it is already gone.
export function deleteReading(id: string) {
  return authedRequest({ method: 'DELETE', path: `/readings/${id}` })
}
