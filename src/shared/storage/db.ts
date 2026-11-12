import Dexie, { type Table } from 'dexie'

export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'synced'

export interface Reading {
  id: string // client UUID, also the idempotency key
  tankId: string // fixed tank key for now
  ph: number
  temperatureC: number
  salinityPpt: number
  oxygenMgL: number
  note?: string
  recordedAt: string // ISO, phone clock
  syncedAt: string | null // server time, never set by the client
  status: SyncStatus
  createdById: string
  isLate: boolean // server-derived
  needsReview: boolean // server-derived
}

// Local session: no secrets (no tokens). It lets the app open offline after a cold start.
export interface LocalSession {
  key: 'current' // single row
  userId: string
  username: string
  permissions: string[] // snapshot from the last successful /users/me
  isSuperAdmin: boolean
  organizationId: string | null
  mustChangePassword: boolean
  savedAt: string // ISO, phone clock
}
class HatcheryDB extends Dexie {
  readings!: Table<Reading, string>
  session!: Table<LocalSession, string>

  constructor() {
    super('hatchery-db')

    // version 1: initial schema. Never edit or remove this call; add version(2) for changes.
    this.version(1).stores({
      readings: 'id, status, recordedAt, createdById, [createdById+tankId+recordedAt]',
    })
    // version 2: adds the local session table. `readings` is repeated unchanged.
    this.version(2).stores({
      readings: 'id, status, recordedAt, createdById, [createdById+tankId+recordedAt]',
      session: 'key',
    })
  }
}

export const db = new HatcheryDB()
