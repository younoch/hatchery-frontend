import { z } from 'zod'

export type ApiErrorKind =
  | 'invalid_credentials' // 401 on login
  | 'session_ended' // 401 on refresh (expired, revoked or reused: the API cannot tell which)
  | 'unauthorized' // 401 on an authenticated call: the access token is missing or expired
  | 'validation' // 400
  | 'throttled' // 429
  | 'network' // offline, timeout, fetch failed
  | 'server' // 5xx
  | 'unknown'

// The error body the backend sends: `code` always, `errors[]` for validation_failed.
// Parsed leniently: a body that does not match (HTML from a proxy, an empty body) is ignored.
const errorBodySchema = z.object({
  code: z.string().optional(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        code: z.string(),
        params: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .optional(),
})

export type ApiFieldError = NonNullable<z.infer<typeof errorBodySchema>['errors']>[number]

export interface ApiErrorDetails {
  code?: string
  errors?: ApiFieldError[]
}

export function parseErrorBody(json: unknown): ApiErrorDetails {
  const parsed = errorBodySchema.safeParse(json)
  return parsed.success ? parsed.data : {}
}
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly code?: string
  readonly errors: ApiFieldError[]

  constructor(kind: ApiErrorKind, status?: number, details: ApiErrorDetails = {}) {
    super(kind)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.code = details.code
    this.errors = details.errors ?? []
  }
}
