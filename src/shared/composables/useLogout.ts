import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { ApiError } from '@/shared/api/apiError'
import { errorMessageKey } from '@/shared/api/errorKey'
import { useToast } from '@/shared/composables/useToast'
import { countUnsentReadings } from '@/shared/storage/readings'
import { useAuthStore } from '@/shared/stores/authStore'

// The state is shared on purpose: the confirm sheet is one component, opened from several screens.
const confirmOpen = ref(false)
const unsentCount = ref(0)
const loggingOut = ref(false)

export function useLogout() {
  const auth = useAuthStore()
  const router = useRouter()
  const toast = useToast()

  async function confirmLogout(): Promise<void> {
    loggingOut.value = true
    try {
      await auth.logout()
      await router.replace('/m/login')
    } catch (error) {
      // Anything that is not an ApiError is a bug: let the global handler report it.
      if (!(error instanceof ApiError)) throw error
      toast.error(error.kind === 'network' ? 'auth.logoutNeedsInternet' : errorMessageKey(error))
    } finally {
      loggingOut.value = false
      confirmOpen.value = false
    }
  }

  // Logout needs the internet. If readings exist only on this phone it asks first, because
  // logging out deletes them.
  async function requestLogout(): Promise<void> {
    if (!navigator.onLine) {
      toast.error('auth.logoutNeedsInternet')
      return
    }
    const count = await countUnsentReadings()
    if (count === 0) {
      await confirmLogout()
      return
    }
    unsentCount.value = count
    confirmOpen.value = true
  }

  return { confirmOpen, unsentCount, loggingOut, requestLogout, confirmLogout }
}