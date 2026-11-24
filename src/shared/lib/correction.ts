import { clockSkewMs } from '@/shared/lib/clockSkew'
import type { Reading } from '@/shared/storage/db'

// The buttons hide for the last minute of the window (owner decision 2026-11-23): the server
// decides in the end, but the user should not press a button the server is about to refuse.
export const CORRECTION_MARGIN_MS = 60_000

// The server's time as far as the phone can tell: the phone clock minus the measured skew (0 when
// nothing has been measured yet, which is the phone clock itself).
export function estimatedServerNow(): number {
  return Date.now() - (clockSkewMs.value ?? 0)
}

// Milliseconds left of the author's correction window (negative: closed or unknown).
export function correctionTimeLeftMs(reading: Reading): number {
  if (!reading.editableUntil) return -1
  return Date.parse(reading.editableUntil) - estimatedServerNow()
}

// A `synced` reading whose window is open and has more than a minute left.
export function isCorrectable(reading: Reading): boolean {
  return reading.status === 'synced' && correctionTimeLeftMs(reading) > CORRECTION_MARGIN_MS
}



// The reading was changed after it was first synced (on this phone or on another).
export function isCorrected(reading: Reading): boolean {
  return (
    !!reading.updatedAt &&
    !!reading.syncedAt &&
    Date.parse(reading.updatedAt) > Date.parse(reading.syncedAt)
  )
}

// What is left of the window for the card: whole hours rounded down (never more than there is),
// under an hour in minutes. Call it only while `isCorrectable` is true.
export function correctionTimeLeft(reading: Reading): {
  key: 'water.timeLeftHours' | 'water.timeLeftMinutes'
  count: number
} {
  const ms = correctionTimeLeftMs(reading)
  const hours = Math.floor(ms / 3_600_000)
  if (hours >= 1) return { key: 'water.timeLeftHours', count: hours }
  return { key: 'water.timeLeftMinutes', count: Math.max(1, Math.floor(ms / 60_000)) }
}