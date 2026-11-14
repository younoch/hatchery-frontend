import { db } from '@/shared/storage/db'

// Clears everything stored for the signed-in user on this phone. Every new table is added here.
export async function clearAllLocalData(): Promise<void> {
  await db.transaction('rw', db.readings, db.session, db.tanks, db.meta, async () => {
    await db.readings.clear()
    await db.session.clear()
    await db.tanks.clear()
    await db.meta.clear()
  })
}

// The "clear cache and reload" button: everything except the login session. The tanks and the
// user's readings are fetched again afterwards.
export async function clearCachedData(): Promise<void> {
  await db.transaction('rw', db.readings, db.tanks, db.meta, async () => {
    await db.readings.clear()
    await db.tanks.clear()
    await db.meta.clear()
  })
}
