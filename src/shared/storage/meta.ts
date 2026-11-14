import { db } from '@/shared/storage/db'

const RESTORED_KEY = 'readingsRestoredAt'

// When the user's own readings were last restored from the server on this phone, if ever. The
// marker lives in Dexie, so a logout (which clears everything) clears it too.
export async function getRestoredAt(): Promise<string | undefined> {
  return (await db.meta.get(RESTORED_KEY))?.value
}

export async function setRestoredAt(iso: string): Promise<void> {
  await db.meta.put({ key: RESTORED_KEY, value: iso })
}