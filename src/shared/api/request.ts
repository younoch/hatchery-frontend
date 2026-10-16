import { z } from 'zod'
import env from '@/shared/utils/env'
import { AuthError, type AuthErrorKind } from '@/shared/api/authAdapter'
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
  statusMap?: Partial<Record<number, AuthErrorKind>>
}

function kindFor(status: number, statusMap?: Partial<Record<number, AuthErrorKind>>): AuthErrorKind {
  const mapped = statusMap?.[status]
  if (mapped) return mapped
  if (status === 401) return 'unauthorized'
  if (status === 400) return 'validation'
  if (status === 429) return 'throttled'
  if (status >= 500) return 'server'
  return 'unknown'
}

export async function request<T extends z.ZodTypeAny>(
  options: RequestOptions<T>,
): Promise<z.infer<T>> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`

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
    throw new AuthError('network')
  }

  if (!response.ok) {
    throw new AuthError(kindFor(response.status, options.statusMap), response.status)
  }

  if (!options.schema) return undefined as z.infer<T>

  let json: unknown
  try {
    json = await response.json()
  } catch {
    throw new AuthError('unknown', response.status)
  }

  const parsed = envelopeSchema(options.schema).safeParse(json)
  if (!parsed.success) throw new AuthError('unknown', response.status)
  return parsed.data.data
}