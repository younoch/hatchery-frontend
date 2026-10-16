import type { z } from 'zod'
import { AuthError } from '@/shared/api/authAdapter'
import { request, type RequestOptions } from '@/shared/api/request'
import { getAccessToken, refreshSession } from '@/shared/api/sessionManager'

type AuthedOptions<T extends z.ZodTypeAny> = Omit<RequestOptions<T>, 'accessToken'>

// Calls the API with the in-memory access token. On a 401 (or a missing token after a cold
// start) it refreshes once and retries once. If the refresh fails the error is thrown as is:
// `session_ended` means the caller must send the user to the login screen.
export async function authedRequest<T extends z.ZodTypeAny>(
  options: AuthedOptions<T>,
): Promise<z.infer<T>> {
  const token = getAccessToken() ?? (await refreshSession())

  try {
    return await request({ ...options, accessToken: token })
  } catch (error) {
    if (!(error instanceof AuthError) || error.kind !== 'unauthorized') throw error
    const fresh = await refreshSession()
    return request({ ...options, accessToken: fresh })
  }
}