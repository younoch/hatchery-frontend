import { db, type Tank } from '@/shared/storage/db'
import type { ApiTank } from '@/shared/schemas/tank.schema'

// Tanks in the server's order (by name). Inactive ones are included: the history needs their names.
export async function getTanks(): Promise<Tank[]> {
  return db.tanks.orderBy('position').toArray()
}

// The whole list replaces the cache, so a tank that is gone from the server is gone here too.
export async function replaceTanks(tanks: ApiTank[]): Promise<void> {
  await db.transaction('rw', db.tanks, async () => {
    await db.tanks.clear()
    await db.tanks.bulkPut(tanks.map((tank, position) => ({ ...tank, position })))
  })
}