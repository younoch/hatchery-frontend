import type { ApiError, ApiErrorKind } from '@/shared/api/apiError'

// Backend error codes that have a message of their own. A new code is added here and to both
// locale files (`api.errors`) in the same change.
const CODE_KEYS: Partial<Record<string, string>> = {
  invalid_credentials: 'api.errors.invalid_credentials',
  user_inactive: 'api.errors.user_inactive',
  too_short: 'api.errors.too_short',
  invalid_username: 'api.errors.invalid_username',
  rate_limited: 'api.errors.rate_limited',
}

// Fallback when the code has no message of its own: the kind decides.
const KIND_KEYS: Record<ApiErrorKind, string> = {
  invalid_credentials: 'api.errors.invalid_credentials',
  session_ended: 'auth.error.unknown',
  unauthorized: 'auth.error.unknown',
  validation: 'auth.error.validation',
  throttled: 'api.errors.rate_limited',
  network: 'auth.error.network',
  server: 'auth.error.server',
  unknown: 'auth.error.unknown',
}

// Never uses the backend message text. Field error codes (inside `errors[]`) are tried first,
// then the response code, then the kind.
export function errorMessageKey(error: ApiError): string {
  for (const code of [...error.errors.map(item => item.code), error.code]) {
    const key = code === undefined ? undefined : CODE_KEYS[code]
    if (key) return key
  }
  return KIND_KEYS[error.kind]
}