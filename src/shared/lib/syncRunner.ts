import { watch } from 'vue'

import { useToast } from '@/shared/composables/useToast'
import { runSync, type SyncOutcome } from '@/shared/lib/syncEngine'
import { useAuthStore } from '@/shared/stores/authStore'
import { useErrorStore } from '@/shared/stores/errorStore'

let current: Promise<void> | null = null
let rerun = false

// What to do when a run stopped early. Offline, a failing server and permission_denied stay
// silent: the readings are pending again and the next trigger tries once more.
async function handle(outcome: SyncOutcome): Promise<void> {
  const toast = useToast()
  if (outcome.differentDuplicates.length > 0) toast.info('sync.differentDuplicate')

  switch (outcome.stoppedBy) {
    case 'session_ended':
      // The refresh failed too: forced logout, all local data cleared (decision 2026-11-10).
      await useAuthStore().clearSession()
      break
    case 'no_organization':
      toast.error('water.noOrganization')
      break
    case 'bug':
      useErrorStore().report(outcome.bugError, 'syncEngine')
      break
    default:
      break
  }
}

async function runOnce(): Promise<void> {
  if (!useAuthStore().canUseOrganization) return
  const outcome = await runSync()
  if (outcome) await handle(outcome)
}

// Asks for a sync and returns a promise that resolves when it is done. A request that arrives
// while a run is going makes it run once more at the end, so a reading saved meanwhile does not
// wait for the next trigger; the caller gets the same promise, so logout can wait for the run.
export function requestSync(): Promise<void> {
  if (current) {
    rerun = true
    return current
  }
  current = (async () => {
    try {
      do {
        rerun = false
        await runOnce()
      } while (rerun)
    } finally {
      current = null
    }
  })()
  return current
}

// Wires the triggers: login or app start, `online`, coming back to the app. A save calls
// `requestSync()` itself. Called once from main.ts.
export function startSync(): void {
  const auth = useAuthStore()

  watch(
    () => auth.canUseOrganization,
    can => {
      if (can) void requestSync()
    },
    { immediate: true }
  )

  window.addEventListener('online', () => void requestSync())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void requestSync()
  })
}
