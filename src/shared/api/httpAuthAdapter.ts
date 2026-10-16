import type { AuthAdapter } from '@/shared/api/authAdapter'
import { request } from '@/shared/api/request'
import { accessTokenSchema, meSchema } from '@/shared/schemas/auth.schema'

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
      path: '/user/me',
      schema: meSchema,
      accessToken,
    })
  },

  async logout() {
    // The cookie Path is /auth/refresh, so only this route receives the cookie.
    await request({ method: 'POST', path: '/auth/refresh/logout' })
  },
}