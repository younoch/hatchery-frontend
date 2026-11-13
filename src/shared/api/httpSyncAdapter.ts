import { authedRequest } from '@/shared/api/authedRequest'
import type { SyncAdapter } from '@/shared/api/syncAdapter'
import { syncResponseSchema } from '@/shared/schemas/sync.schema'
import type { Reading } from '@/shared/storage/db'

const SYNC_TIMEOUT_MS = 20_000

// Only the fields the server accepts: never createdById, syncedAt, status or attempts.
function toItem(reading: Reading) {
  return {
    id: reading.id,
    tankId: reading.tankId,
    recordedAt: reading.recordedAt,
    ph: reading.ph,
    temperatureC: reading.temperatureC,
    salinityPpt: reading.salinityPpt,
    oxygenMgL: reading.oxygenMgL,
    ...(reading.note ? { note: reading.note } : {}),
  }
}

export const httpSyncAdapter: SyncAdapter = {
  sendReadings(readings) {
    return authedRequest({
      method: 'POST',
      path: '/readings/sync',
      body: { items: readings.map(toItem) },
      schema: syncResponseSchema,
      timeoutMs: SYNC_TIMEOUT_MS,
    })
  },
}