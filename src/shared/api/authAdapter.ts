import type { AuthUser, LoginCredentials } from '@/shared/schemas/auth.schema'

export type AuthErrorKind =
  | 'invalid_credentials' // 401 on login
  | 'session_ended' // 401 on refresh (expired, revoked or reused: the API cannot tell which)
  | 'validation' // 400
  | 'throttled' // 429
  | 'network' // offline, timeout, fetch failed
  | 'server' // 5xx
  | 'unknown'

export class AuthError extends Error {
  readonly kind: AuthErrorKind
  readonly status?: number

  constructor(kind: AuthErrorKind, status?: number) {
    super(kind)
    this.name = 'AuthError'
    this.kind = kind
    this.status = status
  }
}

// Every method returns plain data and throws AuthError. The access token is returned to the
// caller (the auth store keeps it in memory); the adapter never stores it.
export interface AuthAdapter {
  login(credentials: LoginCredentials): Promise<string>
  refresh(): Promise<string>
  logout(): Promise<void>
  fetchMe(accessToken: string): Promise<AuthUser>
}