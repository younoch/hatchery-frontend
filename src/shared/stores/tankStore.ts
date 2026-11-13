import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { ApiError } from '@/shared/api/apiError'
import { fetchTanks } from '@/shared/api/tanksApi'
import type { Tank } from '@/shared/storage/db'
import { getTanks, replaceTanks } from '@/shared/storage/tanks'
import { useAuthStore } from '@/shared/stores/authStore'

// A refresh that is not forced (the reading form asks for one when it opens) runs at most this
// often (owner decision 2026-11-13).
const MIN_INTERVAL_MS = 10 * 60_000

export const useTankStore = defineStore('tanks', () => {
  const auth = useAuthStore()
  const tanks = ref<Tank[]>([])
  const loaded = ref(false) // the cache has been read
  const loading = ref(false)
  const failed = ref(false) // the last fetch failed
  let lastFetchedAt = 0
  let inFlight: Promise<void> | null = null

  // Only a signed-in user with an organization and no password change due can call /tanks.
  const eligible = computed(() => auth.canUseOrganization)

  const activeTanks = computed(() => tanks.value.filter(tank => tank.isActive))

  // Why the reading form cannot offer a tank (null when it can). Nothing is reported until the
  // cache has been read and no fetch is running, so the form never flashes a message.
  const emptyReason = computed<'noOrganization' | 'noTank' | 'failed' | null>(() => {
    const user = auth.user
    if (auth.status !== 'authenticated' || user === null) return null
    if (user.organizationId === null) return 'noOrganization'
    if (!loaded.value || loading.value || activeTanks.value.length > 0) return null
    return failed.value && tanks.value.length === 0 ? 'failed' : 'noTank'
  })

  function nameOf(id: string): string | undefined {
    return tanks.value.find(tank => tank.id === id)?.name
  }

  async function loadFromCache(): Promise<void> {
    tanks.value = await getTanks()
    loaded.value = true
  }

  async function fetchAndCache(): Promise<void> {
    loading.value = true
    try {
      await replaceTanks(await fetchTanks())
      tanks.value = await getTanks()
      failed.value = false
      lastFetchedAt = Date.now()
    } catch (error) {
      // Anything that is not an ApiError is a bug: let the global handler report it.
      if (!(error instanceof ApiError)) throw error
      failed.value = true
      if (error.kind === 'session_ended') await auth.clearSession()
    } finally {
      loading.value = false
    }
  }

  // Fetches the list and replaces the cache. Only one fetch runs at a time. `force` skips the
  // 10-minute limit (login, app start, `online`).
  function refresh(force = false): Promise<void> {
    if (!eligible.value) return Promise.resolve()
    if (!force && Date.now() - lastFetchedAt < MIN_INTERVAL_MS) return Promise.resolve()
    if (inFlight) return inFlight
    inFlight = fetchAndCache().finally(() => {
      inFlight = null
    })
    return inFlight
  }

  function reset(): void {
    tanks.value = []
    loaded.value = false
    failed.value = false
    lastFetchedAt = 0
  }

  return {
    tanks,
    activeTanks,
    emptyReason,
    loaded,
    loading,
    failed,
    eligible,
    nameOf,
    loadFromCache,
    refresh,
    reset,
  }
})
