import type { AuthAdapter } from '@/shared/api/authAdapter'
import { authedRequest } from '@/shared/api/authedRequest'
import { request } from '@/shared/api/request'
import { accessTokenSchema, meSchema, passwordChangedSchema } from '@/shared/schemas/auth.schema'

export const httpAuthAdapter: AuthAdapter = {
  async login(credentials) {
    const data = await request({
      method: 'POST',
      path: '/auth/login',
      body: credentials,
      schema: accessTokenSchema,
      statusMap: { 401: 'invalid_credentials' },
    })
    return data.access_token
  },

  async refresh() {
    const data = await request({
      method: 'POST',
      path: '/auth/refresh',
      schema: accessTokenSchema,
      statusMap: { 401: 'session_ended' },
    })
    return data.access_token
  },

  fetchMe(accessToken) {
    return request({
      path: '/users/me',
      schema: meSchema,
      accessToken,
    })
  },

  async changePassword(input) {
    const data = await authedRequest({
      method: 'PATCH',
      path: '/users/me/password',
      body: input,
      schema: passwordChangedSchema,
    })
    return data.access_token
  },

  async logout() {
    // The cookie Path is /auth/refresh, so only this route receives the cookie.
    await request({ method: 'POST', path: '/auth/refresh/logout' })
  },
}
