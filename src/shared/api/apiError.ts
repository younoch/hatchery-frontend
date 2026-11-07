export type ApiErrorKind =
  | 'invalid_credentials' // 401 on login
  | 'session_ended' // 401 on refresh (expired, revoked or reused: the API cannot tell which)
  | 'unauthorized' // 401 on an authenticated call: the access token is missing or expired
  | 'validation' // 400
  | 'throttled' // 429
  | 'network' // offline, timeout, fetch failed
  | 'server' // 5xx
  | 'unknown'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, status?: number) {
    super(kind)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}