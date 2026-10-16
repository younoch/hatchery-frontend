import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AuthError } from '@/shared/api/authAdapter'
import { httpAuthAdapter } from '@/shared/api/httpAuthAdapter'
import { getAccessToken, refreshSession, setAccessToken } from '@/shared/api/sessionManager'
import type { AuthUser, LoginCredentials } from '@/shared/schemas/auth.schema'

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

  function clearSession(): void {
    setAccessToken(null)
    user.value = null
    status.value = 'anonymous'
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    const token = await httpAuthAdapter.login(credentials)
    setAccessToken(token)
    setSession(await httpAuthAdapter.fetchMe(token))
  }

  // Restores the session after a reload: the refresh cookie gives a new access token.
  // session_ended means log in again; any other error (offline, server) is rethrown so the
  // caller can decide (20d adds the offline local session).
  async function bootstrap(): Promise<void> {
    try {
      const token = getAccessToken() ?? (await refreshSession())
      setSession(await httpAuthAdapter.fetchMe(token))
    } catch (error) {
      if (error instanceof AuthError && (error.kind === 'session_ended' || error.kind === 'unauthorized')) {
        clearSession()
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