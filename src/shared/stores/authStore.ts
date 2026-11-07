import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError } from '@/shared/api/apiError'
import { httpAuthAdapter } from '@/shared/api/httpAuthAdapter'
import { getAccessToken, refreshSession, setAccessToken } from '@/shared/api/sessionManager'
import type { AuthUser, LoginCredentials } from '@/shared/schemas/auth.schema'
import { clearLocalSession, getLocalSession, saveLocalSession } from '@/shared/storage/session'
export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  // 'unknown' until bootstrap() finishes, so the route guard can wait instead of flashing /login.
  const status = ref<AuthStatus>('unknown')

  const isAuthenticated = computed(() => status.value === 'authenticated')
  const permissions = computed(() => new Set(user.value?.permissions ?? []))

  // Permission keys only, never role names. Hiding a button is UX; the backend enforces.
  // TODO(verify): the backend does not expose isSuperAdmin yet (backend task 7).
  function hasPermission(key: string): boolean {
    if (user.value?.isSuperAdmin) return true
    return permissions.value.has(key)
  }

  function setSession(next: AuthUser): void {
    user.value = next
    status.value = 'authenticated'
  }

  async function clearSession(): Promise<void> {
    setAccessToken(null)
    user.value = null
    status.value = 'anonymous'
    await clearLocalSession()
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    const token = await httpAuthAdapter.login(credentials)
    setAccessToken(token)
    const me = await httpAuthAdapter.fetchMe(token)
    setSession(me)
    await saveLocalSession(me)
  }

  // Restores the session after a reload: the refresh cookie gives a new access token.
  // session_ended means log in again; any other error (offline, server) is rethrown so the
  // caller can decide (20d adds the offline local session).
  async function bootstrap(): Promise<void> {
    try {
      const token = getAccessToken() ?? (await refreshSession())
      const me = await httpAuthAdapter.fetchMe(token)
      setSession(me)
      await saveLocalSession(me)
    } catch (error) {
      if (error instanceof ApiError && (error.kind === 'session_ended' || error.kind === 'unauthorized')) {
        await clearSession()
        return
      }
      // Offline or server down: fall back to the local session if there is one.
      if (error instanceof ApiError && (error.kind === 'network' || error.kind === 'server')) {
        const local = await getLocalSession()
        if (local) {
          setSession({
            id: local.userId,
            email: local.email,
            roleName: null,
            permissions: local.permissions,
            isSuperAdmin: local.isSuperAdmin,
          })
          return
        }
        status.value = 'anonymous'
        return
      }
      throw error
    }
  }

  // Local logout always succeeds, even if the server call fails (offline).
  // Logout never touches IndexedDB: pending readings stay.
  async function logout(): Promise<void> {
    try {
      await httpAuthAdapter.logout()
    } catch {
      // ignored on purpose
    } finally {
      clearSession()
    }
  }

  return { user, status, isAuthenticated, hasPermission, login, bootstrap, logout, clearSession }
})