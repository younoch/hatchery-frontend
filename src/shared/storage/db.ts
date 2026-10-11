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

class HatcheryDB extends Dexie {
  readings!: Table<Reading, string>

  constructor() {
    super('hatchery-db')

    // version 1: initial schema. Never edit or remove this call; add version(2) for changes.
    this.version(1).stores({
      readings: 'id, status, recordedAt, createdById, [createdById+tankId+recordedAt]',
    })
  }
}

export const db = new HatcheryDB()
