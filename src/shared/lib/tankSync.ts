import { watch } from 'vue'
import type { Router } from 'vue-router'

import { useAuthStore } from '@/shared/stores/authStore'
import { useTankStore } from '@/shared/stores/tankStore'

// Wires the triggers that keep the tank cache fresh. Called once from main.ts.
export function startTankSync(router: Router): void {
  const auth = useAuthStore()
  const tanks = useTankStore()

  // After login or a restored session: show the cache at once, then fetch. Otherwise forget.
  watch(
    () => tanks.eligible,
    async eligible => {
      if (!eligible) {
        tanks.reset()
        return
      }
      await tanks.loadFromCache()
      await tanks.refresh(true)
    },
    { immediate: true },
  )

  window.addEventListener('online', () => void tanks.refresh(true))

  // A session that ends while the app is open (refresh failed, forced logout) sends the user to
  // the login screen.
  watch(
    () => auth.status,
    (status, previous) => {
      if (previous === 'authenticated' && status === 'anonymous') void router.replace('/m/login')
    },
  )
}