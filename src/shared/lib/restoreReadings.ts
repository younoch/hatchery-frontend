import { ApiError } from '@/shared/api/apiError'
import { fetchReadingsPage } from '@/shared/api/readingsApi'
import { getRestoredAt, setRestoredAt } from '@/shared/storage/meta'
import { addRestoredReadings, SYNCED_RETENTION_DAYS } from '@/shared/storage/readings'
import { useAuthStore } from '@/shared/stores/authStore'

const MAX_PAGES = 200 // a guard against a cursor that never ends (100 readings each)

let current: Promise<void> | null = null

async function run(): Promise<void> {
  const auth = useAuthStore()
  const user = auth.user
  if (!auth.canUseOrganization || !user || !navigator.onLine) return
  if (await getRestoredAt()) return

  // The same window the phone keeps synced readings for, so cleanup does not remove them again.
  const from = new Date(Date.now() - SYNCED_RETENTION_DAYS * 86_400_000).toISOString()
  try {
    let cursor: string | undefined
    for (let page = 0; page < MAX_PAGES; page++) {
      const result = await fetchReadingsPage({ from, cursor })
      // A logout or another user while the page was on its way: store nothing for the old user.
      if (auth.user?.id !== user.id) return
      await addRestoredReadings(result.items, user.id)
      if (!result.nextCursor) {
        await setRestoredAt(new Date().toISOString())
        return
      }
      cursor = result.nextCursor
    }
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    // Offline or a server problem: the marker stays unset, so the next trigger tries again.
    if (error.kind === 'session_ended') await auth.clearSession()
  }
}

// Restores the user's own readings of the last 30 days once per login. One run at a time.
export function restoreOwnReadings(): Promise<void> {
  if (!current) {
    current = run().finally(() => {
      current = null
    })
  }
  return current
}