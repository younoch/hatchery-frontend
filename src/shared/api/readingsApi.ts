import { authedRequest } from '@/shared/api/authedRequest'
import { readingListSchema } from '@/shared/schemas/readingList.schema'

const PAGE_SIZE = 100

// One page of the signed-in user's own readings, newest first. The same `from` must be sent with
// every cursor.
export function fetchReadingsPage(options: { from: string; cursor?: string }) {
  const query = new URLSearchParams({ from: options.from, limit: String(PAGE_SIZE) })
  if (options.cursor) query.set('cursor', options.cursor)
  return authedRequest({ path: `/readings?${query.toString()}`, schema: readingListSchema })
}