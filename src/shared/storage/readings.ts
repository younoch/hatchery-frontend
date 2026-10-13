import Dexie from 'dexie'

import type { WaterReadingInput } from '@/shared/schemas/waterQuality.schema'
import { db, type Reading } from './db'

// TODO(Step 20): replace with the real logged-in user id.
export const STUB_USER_ID = 'stub-user'

// Config constant, changeable without a schema migration (plan section 6).
export const SYNCED_RETENTION_DAYS = 30

export async function createReading(
  input: WaterReadingInput,
  userId: string = STUB_USER_ID
): Promise<Reading> {
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

export async function listReadings(userId: string = STUB_USER_ID): Promise<Reading[]> {
  const rows = await db.readings.where('createdById').equals(userId).toArray()
  return rows.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
}

// Edit and delete are allowed only while the record is still pending (plan section 6).
export async function updatePendingReading(
  id: string,
  changes: Partial<WaterReadingInput>
): Promise<boolean> {
  return db.transaction('rw', db.readings, async () => {
    const current = await db.readings.get(id)
    if (!current || current.status !== 'pending') return false
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
    if (!current || current.status !== 'pending') return false
    await db.readings.delete(id)
    return true
  })
}

// The current user's own latest reading for a tank (local data only).
export async function getLatestReading(
  tankId: string,
  userId: string = STUB_USER_ID
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
export async function countUnsyncedReadings(userId: string = STUB_USER_ID): Promise<number> {
  return db.readings
    .where('createdById')
    .equals(userId)
    .and(reading => reading.status === 'pending' || reading.status === 'syncing')
    .count()
}

// Local only until the sync engine (Step 21): puts a failed record back in the queue.
export async function retryFailedReading(id: string): Promise<boolean> {
  return db.transaction('rw', db.readings, async () => {
    const current = await db.readings.get(id)
    if (!current || current.status !== 'failed') return false
    await db.readings.update(id, { status: 'pending' })
    return true
  })
}

