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