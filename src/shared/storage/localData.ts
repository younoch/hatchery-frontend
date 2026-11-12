import { db } from '@/shared/storage/db'

// Clears everything stored for the signed-in user on this phone. Every new table (tanks in
// Step 21b) is added here.
export async function clearAllLocalData(): Promise<void> {
  await db.transaction('rw', db.readings, db.session, async () => {
    await db.readings.clear()
    await db.session.clear()
  })
}