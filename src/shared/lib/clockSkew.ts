import { ref } from 'vue'

import { RECORDED_AT_MAX_FUTURE_MS } from '@/shared/schemas/waterQuality.schema'

// The server rejects a recordedAt more than this far ahead of its own clock (B→F-28).
const SERVER_FUTURE_WINDOW_MS = 10 * 60_000

// The form warns when the phone clock differs from the server's by more than this: the server's
// window minus the frontend's own, so a reading the form accepts is never rejected because of
// the phone clock.
export const CLOCK_SKEW_WARN_MS = SERVER_FUTURE_WINDOW_MS - RECORDED_AT_MAX_FUTURE_MS

// Phone clock minus server clock, from the `timestamp` of the last successful response
// (positive: the phone is ahead). null until a response has been seen. Memory only: after a
// restart it is unknown until the first response, and offline it cannot be known.
export const clockSkewMs = ref<number | null>(null)

// `sentAt` and `receivedAt` are phone times around the request; their middle approximates the
// phone time at which the server stamped the response.
export function recordServerTime(serverIso: string, sentAt: number, receivedAt: number): void {
  const serverTime = Date.parse(serverIso)
  if (Number.isNaN(serverTime)) return
  clockSkewMs.value = (sentAt + receivedAt) / 2 - serverTime
}