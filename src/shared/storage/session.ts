import type { AuthUser } from '@/shared/schemas/auth.schema'
import { db, type LocalSession } from '@/shared/storage/db'

const KEY = 'current'

export async function saveLocalSession(user: AuthUser): Promise<void> {
  await db.session.put({
    key: KEY,
    userId: user.id,
    username: user.username,
    permissions: user.permissions,
    isSuperAdmin: user.isSuperAdmin,
    organizationId: user.organizationId,
    mustChangePassword: user.mustChangePassword,
    savedAt: new Date().toISOString(),
  })
}

export function getLocalSession(): Promise<LocalSession | undefined> {
  return db.session.get(KEY)
}

// Clears only the session row. Readings are never touched here.
export async function clearLocalSession(): Promise<void> {
  await db.session.delete(KEY)
}
