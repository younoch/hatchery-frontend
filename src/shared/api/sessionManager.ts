import type { AuthAdapter } from '@/shared/api/authAdapter'
import { ApiError } from '@/shared/api/apiError'
import { httpAuthAdapter } from '@/shared/api/httpAuthAdapter'

const REFRESH_LOCK = 'hatchery-auth-refresh'

// The access token lives only in memory (never localStorage, never IndexedDB).
let accessToken: string | null = null
let inFlight: Promise<string> | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

async function runRefresh(adapter: AuthAdapter): Promise<string> {
  const token = await adapter.refresh()
  accessToken = token
  return token
}

// Single in-flight refresh per tab; across tabs the Web Lock makes refreshes run one at a
// time. The refresh cookie rotates on every use and the backend has no grace window, so a
// second tab that refreshes with the old cookie would end the session. A tab that waited for
// the lock cannot know the cookie changed, so it simply refreshes again with the new cookie
// (the browser sends the latest cookie automatically).
export function refreshSession(adapter: AuthAdapter = httpAuthAdapter): Promise<string> {
  if (inFlight) return inFlight

  const task = navigator.locks
    ? navigator.locks.request(REFRESH_LOCK, () => runRefresh(adapter))
    : runRefresh(adapter)

  inFlight = task
    .catch((error: unknown) => {
      // A 401 means the session is over: drop the token. Network errors keep it.
      if (error instanceof ApiError && error.kind === 'session_ended') accessToken = null
      throw error
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}