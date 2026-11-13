import { ApiError } from '@/shared/api/apiError'
import { httpSyncAdapter } from '@/shared/api/httpSyncAdapter'
import type { SyncAdapter } from '@/shared/api/syncAdapter'
import type { SyncResponse } from '@/shared/schemas/sync.schema'
import type { Reading } from '@/shared/storage/db'
import {
  listPendingForSync,
  markFailed,
  markPending,
  markSending,
  markSynced,
  resetSyncingToPending,
} from '@/shared/storage/readings'

const LOCK_NAME = 'hatchery-sync'
const CHUNK_SIZE = 20 // the server accepts 100; a smaller chunk loses less when one fails
const MAX_ATTEMPTS = 3 // per chunk, for a request that did not finish
const BASE_BACKOFF_MS = 2_000
const MAX_WAIT_MS = 60_000

export type SyncStop =
  | 'offline'
  | 'transient' // network, server or rate limit, still failing after the attempts: next trigger
  | 'session_ended' // 401 and the refresh failed: the caller ends the session
  | 'no_organization'
  | 'permission_denied'
  | 'bug' // a response the client cannot explain: the caller reports `bugError`

export interface SyncOutcome {
  synced: number
  failed: number
  // Ids the server already holds with other values (`duplicate` with `identical: false`).
  differentDuplicates: string[]
  stoppedBy?: SyncStop
  bugError?: unknown
}

type ChunkStep = 'continue' | 'smaller' | SyncStop

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

// Seconds from `Retry-After` when readable, otherwise 2 s, 4 s…; never longer than 60 s.
function waitMs(error: ApiError, attempt: number): number {
  const backoff = BASE_BACKOFF_MS * 2 ** attempt
  return Math.min(error.retryAfterMs ?? backoff, MAX_WAIT_MS)
}

async function applyResults(
  chunk: Reading[],
  response: SyncResponse,
  outcome: SyncOutcome,
): Promise<ChunkStep> {
  const byIndex = new Map(response.results.map(result => [result.index, result]))
  const synced: string[] = []
  const unanswered: string[] = []

  for (const [index, reading] of chunk.entries()) {
    const result = byIndex.get(index)
    if (!result) {
      unanswered.push(reading.id)
    } else if (result.status === 'rejected') {
      const first = result.errors?.[0]
      await markFailed(reading.id, first?.code ?? 'rejected', first?.field)
      outcome.failed += 1
    } else {
      synced.push(reading.id)
      if (result.status === 'duplicate' && result.identical === false) {
        outcome.differentDuplicates.push(reading.id)
      }
    }
  }

  await markSynced(synced)
  outcome.synced += synced.length

  if (unanswered.length > 0) {
    // The contract is one result per item; a missing one is a bug, not a reason to lose data.
    await markPending(unanswered)
    outcome.bugError = new Error('sync: the server returned no result for some readings')
    return 'bug'
  }
  return 'continue'
}

async function sendChunk(
  adapter: SyncAdapter,
  chunk: Reading[],
  outcome: SyncOutcome,
): Promise<ChunkStep> {
  const ids = chunk.map(reading => reading.id)
  await markSending(ids)

  for (let attempt = 0; ; attempt++) {
    try {
      const response = await adapter.sendReadings(chunk)
      return await applyResults(chunk, response, outcome)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        await markPending(ids) // a bug: release the readings, then let the global handler report it
        throw error
      }

      if (error.status === 413) {
        if (chunk.length > 1) {
          await markPending(ids)
          return 'smaller'
        }
        for (const reading of chunk) await markFailed(reading.id, 'payload_too_large')
        outcome.failed += chunk.length
        return 'continue'
      }

      if (error.kind === 'session_ended' || error.kind === 'unauthorized') {
        await markPending(ids)
        return 'session_ended'
      }

      if (error.status === 403) {
        await markPending(ids)
        return error.code === 'no_organization' ? 'no_organization' : 'permission_denied'
      }

      if (error.kind === 'throttled' || error.kind === 'network' || error.kind === 'server') {
        if (!navigator.onLine) {
          await markPending(ids)
          return 'offline'
        }
        if (attempt + 1 >= MAX_ATTEMPTS) {
          await markPending(ids)
          return 'transient'
        }
        await sleep(waitMs(error, attempt))
        continue
      }

      await markPending(ids) // 400 validation_failed (a bad envelope) or anything unexplained
      outcome.bugError = error
      return 'bug'
    }
  }
}

async function drain(adapter: SyncAdapter, outcome: SyncOutcome): Promise<void> {
  let chunkSize = CHUNK_SIZE
  for (;;) {
    const pending = await listPendingForSync()
    if (pending.length === 0) return

    const step = await sendChunk(adapter, pending.slice(0, chunkSize), outcome)
    if (step === 'continue') continue
    if (step === 'smaller') {
      chunkSize = Math.max(1, Math.floor(chunkSize / 2))
      continue
    }
    outcome.stoppedBy = step
    return
  }
}

let running = false // used only when the Web Locks API is missing

// One run at a time, across tabs. Returns null when another run holds the lock.
async function withLock<T>(task: () => Promise<T>): Promise<T | null> {
  if (!('locks' in navigator)) {
    if (running) return null
    running = true
    try {
      return await task()
    } finally {
      running = false
    }
  }
  return navigator.locks.request(LOCK_NAME, { ifAvailable: true }, lock =>
    lock ? task() : null,
  )
}

// Sends every pending reading. The caller decides whether the user may sync at all (signed in,
// has an organization, no password change due) and what to do with the outcome.
export async function runSync(adapter: SyncAdapter = httpSyncAdapter): Promise<SyncOutcome | null> {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0, differentDuplicates: [], stoppedBy: 'offline' }
  }
  return withLock(async () => {
    const outcome: SyncOutcome = { synced: 0, failed: 0, differentDuplicates: [] }
    // Inside the lock no request is running, so a `syncing` record is left over from a closed app.
    await resetSyncingToPending()
    await drain(adapter, outcome)
    return outcome
  })
}