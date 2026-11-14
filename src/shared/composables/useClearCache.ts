import { ref } from 'vue'

import { useToast } from '@/shared/composables/useToast'
import { restoreOwnReadings } from '@/shared/lib/restoreReadings'
import { requestSync } from '@/shared/lib/syncRunner'
import { clearCachedData } from '@/shared/storage/localData'
import { countUnsentReadings } from '@/shared/storage/readings'
import { useTankStore } from '@/shared/stores/tankStore'

// The state is shared on purpose: the confirm sheet is one component, opened from the More sheet.
const confirmOpen = ref(false)
const unsentCount = ref(0)
const working = ref(false)

export function useClearCache() {
  const tanks = useTankStore()
  const toast = useToast()

  async function clearAndReload(): Promise<void> {
    working.value = true
    try {
      await clearCachedData()
      tanks.reset()
      await tanks.loadFromCache()
      await Promise.all([tanks.refresh(true), restoreOwnReadings()])
      if (tanks.failed) toast.error('cache.failed')
      else toast.success('cache.done')
    } finally {
      working.value = false
      confirmOpen.value = false
    }
  }

  // Needs the internet to fetch everything again. It first tries to send what is waiting; if
  // readings are still unsent (pending or failed) it asks first, because clearing deletes them.
  async function requestClear(): Promise<void> {
    if (working.value) return
    if (!navigator.onLine) {
      toast.error('cache.needsInternet')
      return
    }
    working.value = true
    try {
      toast.info('auth.logoutSyncing')
      await requestSync()
      toast.dismiss()
    } finally {
      working.value = false
    }
    const count = await countUnsentReadings()
    if (count === 0) {
      await clearAndReload()
      return
    }
    unsentCount.value = count
    confirmOpen.value = true
  }

  return { confirmOpen, unsentCount, working, requestClear, clearAndReload }
}