import { z } from 'zod'
import env from '@/shared/utils/env'
import { ApiError, parseErrorBody, type ApiErrorKind } from '@/shared/api/apiError'
import { recordServerTime } from '@/shared/lib/clockSkew'
import { envelopeSchema } from '@/shared/schemas/auth.schema'

const DEFAULT_TIMEOUT_MS = 10_000

export interface RequestOptions<T extends z.ZodTypeAny> {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  schema?: T
  body?: unknown
  accessToken?: string
  timeoutMs?: number
  // Maps an HTTP status to an error kind for this call (e.g. 401 on login).
  statusMap?: Partial<Record<number, ApiErrorKind>>
}

// `Retry-After` is seconds (or an HTTP date). Across origins the browser only lets us read it if
// the backend exposes it; undefined when absent or unreadable.
function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds) * 1000
  const date = Date.parse(value)
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now())
}

function kindFor(status: number, statusMap?: Partial<Record<number, ApiErrorKind>>): ApiErrorKind {
  const mapped = statusMap?.[status]
  if (mapped) return mapped
  if (status === 401) return 'unauthorized'
  if (status === 400) return 'validation'
  if (status === 429) return 'throttled'
  if (status >= 500) return 'server'
  return 'unknown'
}

export async function request<T extends z.ZodTypeAny>(
  options: RequestOptions<T>
): Promise<z.infer<T>> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`

  const sentAt = Date.now()
  let response: Response
  try {
    response = await fetch(`${env.VITE_API_URL}${options.path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'include',
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    })
  } catch {
    // Offline, DNS failure, CORS failure and timeout all look the same to the caller.
    throw new ApiError('network')
  }

  const receivedAt = Date.now()
  if (!response.ok) {
    const details = await response.json().then(parseErrorBody, () => ({}))
    const retryAfterMs = parseRetryAfter(response.headers.get('Retry-After'))
    throw new ApiError(kindFor(response.status, options.statusMap), response.status, {
      ...details,
      retryAfterMs,
    })
  }

  if (!options.schema) return undefined as z.infer<T>

  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw new ApiError('unknown', response.status)
  }

  const parsed = envelopeSchema(options.schema).safeParse(json)
  if (!parsed.success) throw new ApiError('unknown', response.status)
  recordServerTime(parsed.data.timestamp, sentAt, receivedAt)
  return parsed.data.data
}
