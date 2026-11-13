import type { SyncResponse } from '@/shared/schemas/sync.schema'
import type { Reading } from '@/shared/storage/db'

// What the sync engine needs from the server. The engine talks to this interface only, so a fake
// can be dropped in for tests later (no mock adapter for now, owner decision 2026-11-13).
export interface SyncAdapter {
  // Sends one chunk. Throws ApiError for a failed request; a rejected reading is not an error,
  // it comes back as a result with status `rejected`.
  sendReadings(readings: Reading[]): Promise<SyncResponse>
}