import { fetchOrganizationReadingsPage } from '@/shared/api/readingsApi'
import type { OrgReading } from '@/shared/schemas/readingList.schema'

const MAX_PAGES = 10 // 500 readings each: enough for one tank over 30 days

// The name of the person who recorded a reading, as the charts show it.
export function authorName(reading: OrgReading): string {
  return reading.createdBy.name ?? reading.createdBy.username
}

// All the organization's readings of one tank in a period, oldest first. Throws ApiError.
export async function loadOrganizationReadings(
  tankId: string,
  from: Date,
  to: Date
): Promise<OrgReading[]> {
  const all: OrgReading[] = []
  let cursor: string | undefined
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await fetchOrganizationReadingsPage({ tankId, from, to, cursor })
    all.push(...result.items)
    if (!result.nextCursor) return all
    cursor = result.nextCursor
  }
  return all
}
