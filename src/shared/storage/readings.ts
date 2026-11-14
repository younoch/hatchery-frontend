import Dexie from 'dexie'

import type { WaterReadingInput } from '@/shared/schemas/waterQuality.schema'
import { db, type Reading } from './db'

// Config constant, changeable without a schema migration (plan section 6).
export const SYNCED_RETENTION_DAYS = 30

export async function createReading(input: WaterReadingInput, userId: string): Promise<Reading> {
  const reading: Reading = {
    ...input,
    note: input.note ? input.note : undefined,
    id: crypto.randomUUID(),
    syncedAt: null,
    status: 'pending',
    createdById: userId,
    isLate: false,
    needsReview: false,
  }
  await db.readings.add(reading)
  return reading
}

export async function getReading(id: string): Promise<Reading | undefined> {
  return db.readings.get(id)
}

export async function listReadings(userId: string): Promise<Reading[]> {
  const rows = await db.readings.where('createdById').equals(userId).toArray()
  return rows.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
}

// Editable and deletable only while pending and never sent: after the first send attempt the
// server may already hold the reading (owner decision 2026-11-13).
export function isEditable(reading: Reading): boolean {
  return reading.status === 'pending' && (reading.attempts ?? 0) === 0
}

export async function updatePendingReading(
  id: string,
  changes: Partial<WaterReadingInput>
): Promise<boolean> {
  return db.transaction('rw', db.readings, async () => {
    const current = await db.readings.get(id)
    if (!current || !isEditable(current)) return false
    await db.readings.update(id, {
      ...changes,
      note: changes.note ? changes.note : undefined,
    })
    return true
  })
}

export async function deletePendingReading(id: string): Promise<boolean> {
  return db.transaction('rw', db.readings, async () => {
    const current = await db.readings.get(id)
    if (!current || !isEditable(current)) return false
    await db.readings.delete(id)
    return true
  })
}

// The current user's own latest reading for a tank (local data only).
export async function getLatestReading(
  tankId: string,
  userId: string
): Promise<Reading | undefined> {
  const rows = await db.readings
    .where('[createdById+tankId+recordedAt]')
    .between([userId, tankId, Dexie.minKey], [userId, tankId, Dexie.maxKey])
    .reverse()
    .limit(1)
    .toArray()
  return rows[0]
}

// Synced readings older than the retention window are removed. pending/failed are never touched.
export async function cleanupSyncedReadings(): Promise<number> {
  const cutoff = new Date(Date.now() - SYNCED_RETENTION_DAYS * 86_400_000).toISOString()
  return db.readings
    .where('status')
    .equals('synced')
    .and(reading => reading.recordedAt < cutoff)
    .delete()
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false
  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

// Readings still waiting to reach the server (pending or syncing). failed is not counted.
export async function countUnsyncedReadings(userId: string): Promise<number> {
  return db.readings
    .where('createdById')
    .equals(userId)
    .and(reading => reading.status === 'pending' || reading.status === 'syncing')
    .count()
}

// Readings that exist only on this phone: pending, syncing and failed. The logout warning
// uses it, and it counts every user because logout clears everything.
export async function countUnsentReadings(): Promise<number> {
  return db.readings.where('status').notEqual('synced').count()
}

// The user fixed a rejected reading: it goes back in the queue with the same id. `attempts`
// stays, so it is locked again. Returns false if it is not `failed` any more.
export async function fixFailedReading(id: string, changes: WaterReadingInput): Promise<boolean> {
  return db.transaction('rw', db.readings, async () => {
    const current = await db.readings.get(id)
    if (!current || current.status !== 'failed') return false
    await db.readings.update(id, {
      ...changes,
      note: changes.note ? changes.note : undefined,
      status: 'pending',
      errorCode: undefined,
      errorField: undefined,
    })
    return true
  })
}

// ---- Sync engine helpers (Step 21) ----

// Pending readings, oldest first.
export async function listPendingForSync(): Promise<Reading[]> {
  const rows = await db.readings.where('status').equals('pending').toArray()
  return rows.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
}

// A chunk is about to be sent: the readings become `syncing` and the attempt is counted, so they
// are no longer editable.
export async function markSending(ids: string[]): Promise<void> {
  await db.readings
    .where('id')
    .anyOf(ids)
    .modify(reading => {
      reading.status = 'syncing'
      reading.attempts = (reading.attempts ?? 0) + 1
    })
}

// The server has the readings (created or duplicate).
export async function markSynced(ids: string[]): Promise<void> {
  await db.readings
    .where('id')
    .anyOf(ids)
    .modify(reading => {
      reading.status = 'synced'
      delete reading.errorCode
      delete reading.errorField
    })
}

// The server rejected the reading: it keeps the error code so the card can say why.
export async function markFailed(
  id: string,
  errorCode: string,
  errorField?: string
): Promise<void> {
  await db.readings
    .where('id')
    .equals(id)
    .modify(reading => {
      reading.status = 'failed'
      reading.errorCode = errorCode
      if (errorField) reading.errorField = errorField
      else delete reading.errorField
    })
}

// The request did not finish (offline, throttled, server down): the readings go back in the
// queue. `attempts` stays, so they remain locked.
export async function markPending(ids: string[]): Promise<void> {
  await db.readings.where('id').anyOf(ids).modify({ status: 'pending' })
}

// At app start no request is running, so a `syncing` record is left over from a closed app.
// Sending it again is safe: the server answers `duplicate`.
export async function resetSyncingToPending(): Promise<number> {
  return db.readings.where('status').equals('syncing').modify({ status: 'pending' })
}

// A rejected reading is not on the server, so deleting it loses nothing there. Only a `failed`
// record can be deleted this way.
export async function deleteFailedReading(id: string): Promise<boolean> {
  return db.transaction('rw', db.readings, async () => {
    const current = await db.readings.get(id)
    if (!current || current.status !== 'failed') return false
    await db.readings.delete(id)
    return true
  })
}
