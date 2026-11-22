import { authedRequest } from '@/shared/api/authedRequest'
import {
  orgLatestSchema,
  orgReadingListSchema,
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
