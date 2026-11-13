import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError } from '@/shared/api/apiError'
import { httpAuthAdapter } from '@/shared/api/httpAuthAdapter'
import { getAccessToken, refreshSession, setAccessToken } from '@/shared/api/sessionManager'
import type { AuthUser, ChangePasswordInput, LoginCredentials } from '@/shared/schemas/auth.schema'
import { clearAllLocalData } from '@/shared/storage/localData'
import { clearLocalSession, getLocalSession, saveLocalSession } from '@/shared/storage/session'
export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  // 'unknown' until bootstrap() finishes, so the route guard can wait instead of flashing /login.
  const status = ref<AuthStatus>('unknown')

  const isAuthenticated = computed(() => status.value === 'authenticated')

  // A signed-in user with an organization and no password change due: the only kind that may
  // use organization data (tanks, reading sync).
  const canUseOrganization = computed(() => {
    const current = user.value
    return (
      status.value === 'authenticated' &&
      current !== null &&
      current.organizationId !== null &&
      !current.mustChangePassword
    )
  })
  const permissions = computed(() => new Set(user.value?.permissions ?? []))

  // Permission keys only, never role names. Hiding a button is UX; the backend enforces.

  function hasPermission(key: string): boolean {
    if (user.value?.isSuperAdmin) return true
    return permissions.value.has(key)
  }

  function setSession(next: AuthUser): void {
    user.value = next
    status.value = 'authenticated'
  }

  // Ends the session and clears everything stored on this phone (readings and session), so the
  // next user starts from nothing. Used by logout and by a forced logout (the session ended or
  // the user is inactive): unsent readings are lost, by decision.
  async function clearSession(): Promise<void> {
    setAccessToken(null)
    user.value = null
    status.value = 'anonymous'
    await clearAllLocalData()
  }

  // A user who must change the password has no local session until the change is done, so an
  // offline start cannot skip the forced screen.
  async function persistSession(me: AuthUser): Promise<void> {
    if (me.mustChangePassword) await clearLocalSession()
    else await saveLocalSession(me)
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    const token = await httpAuthAdapter.login(credentials)
    setAccessToken(token)
    const me = await httpAuthAdapter.fetchMe(token)
    setSession(me)
    await persistSession(me)
  }

  // The response carries a new access token and a new refresh cookie. It does not return the
  // user, so the user is fetched again to pick up `mustChangePassword: false`.
  async function changePassword(input: ChangePasswordInput): Promise<void> {
    const token = await httpAuthAdapter.changePassword(input)
    setAccessToken(token)
    const me = await httpAuthAdapter.fetchMe(token)
    setSession(me)
    await persistSession(me)
  }

  // Restores the session after a reload: the refresh cookie gives a new access token.
  // session_ended means log in again; any other error (offline, server) is rethrown so the
  // caller can decide (20d adds the offline local session).
  async function bootstrap(): Promise<void> {
    try {
      const token = getAccessToken() ?? (await refreshSession())
      const me = await httpAuthAdapter.fetchMe(token)
      setSession(me)
      await persistSession(me)
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.kind === 'session_ended' || error.kind === 'unauthorized')
      ) {
        await clearSession()
        return
      }
      // Offline, server down or throttled (429): fall back to the local session if there is one.
      if (
        error instanceof ApiError &&
        (error.kind === 'network' || error.kind === 'server' || error.kind === 'throttled')
      ) {
        const local = await getLocalSession()
        if (local) {
          setSession({
            id: local.userId,
            username: local.username,
            name: null,
            organizationId: local.organizationId,
            roleName: null,
            permissions: local.permissions,
            isSuperAdmin: local.isSuperAdmin,
            mustChangePassword: local.mustChangePassword,
          })
          return
        }
        status.value = 'anonymous'
        return
      }
      throw error
    }
  }

  // Logout needs the server, like login. If the call fails (offline, server down, throttled) the
  // error is thrown and nothing is cleared. A 401 means the session is already over, so it
  // counts as done.
  async function logout(): Promise<void> {
    try {
      await httpAuthAdapter.logout()
    } catch (error) {
      const sessionAlreadyOver = error instanceof ApiError && error.status === 401
      if (!sessionAlreadyOver) throw error
    }
    await clearSession()
  }

  return {
    user,
    status,
    isAuthenticated,
    canUseOrganization,
    hasPermission,
    login,
    changePassword,
    bootstrap,
    logout,
    clearSession,
  }
})
