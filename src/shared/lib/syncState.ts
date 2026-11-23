import type { MarkerName, SyncState } from '@/shared/schemas/syncState.schema'
import { getMarker } from '@/shared/storage/meta'

// What the server's marker says about a resource compared with the one stored on this phone:
// `unknown` (never fetched here), `changed` (different) or `same`.
export async function compareMarker(
  state: SyncState,
  name: MarkerName
): Promise<'unknown' | 'changed' | 'same'> {
  const stored = await getMarker(name)
  if (stored === undefined) return 'unknown'
  return stored === (state[name] ?? '') ? 'same' : 'changed'
}