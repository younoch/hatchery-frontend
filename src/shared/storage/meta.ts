import { db } from '@/shared/storage/db'
import type { MarkerName } from '@/shared/schemas/syncState.schema'

const RESTORED_KEY = 'readingsRestoredAt'

// When the user's own readings were last restored from the server on this phone, if ever. The
// marker lives in Dexie, so a logout (which clears everything) clears it too.
export async function getRestoredAt(): Promise<string | undefined> {
  return (await db.meta.get(RESTORED_KEY))?.value
}

export async function setRestoredAt(iso: string): Promise<void> {
  await db.meta.put({ key: RESTORED_KEY, value: iso })
}

// The change marker (GET /sync/state) of a resource as it was when this phone last fetched it,
// stored exactly as the server sent it ('' for null). undefined: never stored.
export async function getMarker(name: MarkerName): Promise<string | undefined> {
  return (await db.meta.get(`marker:${name}`))?.value
}

export async function setMarker(name: MarkerName, value: string | null): Promise<void> {
  await db.meta.put({ key: `marker:${name}`, value: value ?? '' })
}