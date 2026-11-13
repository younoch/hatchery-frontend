import Dexie, { type Table } from 'dexie'

export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'synced'

export interface Reading {
  id: string // client UUID, also the idempotency key
  tankId: string // tank UUID from the backend
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
  attempts?: number // send attempts so far; a reading is editable only while this is 0 (2026-11-13)
  errorCode?: string // `failed` only: the error code the server gave
  errorField?: string // `failed` only: the field that code is about, when the server named one
}

// A tank of the user's organization, cached from GET /tanks. `position` keeps the server's order.
export interface Tank {
  id: string // UUID
  name: string
  isActive: boolean
  position: number
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
  tanks!: Table<Tank, string>

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
    // version 3: adds the tanks cache. The old test readings used fixed tank ids (`A1`…) that the
    // server would never accept, so the upgrade deletes them (owner decision 2026-11-13).
    this.version(3)
      .stores({
        readings: 'id, status, recordedAt, createdById, [createdById+tankId+recordedAt]',
        session: 'key',
        tanks: 'id, position',
      })
      .upgrade(tx => tx.table('readings').clear())
  }
}

export const db = new HatcheryDB()
