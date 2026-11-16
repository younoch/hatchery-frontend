import type { ApiError, ApiErrorKind } from '@/shared/api/apiError'

// Backend error codes that have a message of their own. A new code is added here and to both
// locale files (`api.errors`) in the same change.
const CODE_KEYS: Partial<Record<string, string>> = {
  invalid_credentials: 'api.errors.invalid_credentials',
  user_inactive: 'api.errors.user_inactive',
  too_short: 'api.errors.too_short',
  weak_password: 'api.errors.weak_password',
  too_long: 'api.errors.too_long',
  username_taken: 'api.errors.username_taken',
  email_taken: 'api.errors.email_taken',
  invalid_format: 'api.errors.invalid_format',
  required: 'api.errors.required',
  tank_name_taken: 'api.errors.tank_name_taken',
  org_admin_protected: 'api.errors.org_admin_protected',
  cannot_target_self: 'api.errors.cannot_target_self',
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

// The same code means something else by field (a password is too short, a name too long).
const FIELD_CODE_KEYS: Partial<Record<string, string>> = {
  'name:too_long': 'api.errors.name_too_long',
}

// The message for one field error of a form (`errors[]` of a 400 validation_failed).
export function fieldErrorKey(field: string, code: string): string {
  return FIELD_CODE_KEYS[`${field}:${code}`] ?? CODE_KEYS[code] ?? 'api.errors.invalid_field'
}

// Codes the backend answers for the whole request that belong to one field of the form.
const RESPONSE_CODE_FIELDS: Record<string, string> = {
  username_taken: 'username',
  email_taken: 'email',
  tank_name_taken: 'name',
}

// The messages to show next to the fields of a form: the backend's `errors[]` for the fields this
// form has, plus `username_taken` and `email_taken`, which the backend answers for the whole request.
export function fieldMessages(error: ApiError, fields: readonly string[]): Record<string, string> {
  const messages: Record<string, string> = {}
  for (const item of error.errors) {
    if (fields.includes(item.field) && !(item.field in messages)) {
      messages[item.field] = fieldErrorKey(item.field, item.code)
    }
  }
  for (const [code, field] of Object.entries(RESPONSE_CODE_FIELDS)) {
    if (error.code === code && fields.includes(field)) messages[field] = fieldErrorKey(field, code)
  }
  return messages
}
