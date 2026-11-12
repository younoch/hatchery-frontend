import { z } from 'zod'

export interface LoginCredentials {
  username: string
  password: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface AuthUser {
  id: string
  username: string
  name: string | null
  organizationId: string | null
  roleName: string | null
  permissions: string[]
  isSuperAdmin: boolean
  mustChangePassword: boolean
}

// Success envelope: { success, statusCode, data, timestamp }
export function envelopeSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    success: z.literal(true),
    statusCode: z.number(),
    data,
    timestamp: z.string(),
  })
}

// POST /auth/login and POST /auth/refresh (the refresh token is a cookie, never in the body)
// Verified 2026-10-16: the body is `data.access_token` (real output).
export const accessTokenSchema = z.object({
  access_token: z.string().min(1),
})

// PATCH /users/me/password (PasswordChangedResponseDto): a new access token; the new refresh
// cookie is set by the response itself.
export const passwordChangedSchema = z.object({
  message: z.string(),
  access_token: z.string().min(1),
})

// GET /users/me (MeResponseDto in openapi.json): every field is always present.
export const meSchema = z
  .object({
    id: z.string(),
    username: z.string(),
    name: z.string().nullable(),
    isSuperAdmin: z.boolean(),
    organizationId: z.string().nullable(),
    permissions: z.array(z.string()),
    mustChangePassword: z.boolean(),
    role: z.object({ name: z.string() }).nullable(),
  })
  .transform((me): AuthUser => ({
    id: me.id,
    username: me.username,
    name: me.name,
    organizationId: me.organizationId,
    roleName: me.role?.name ?? null,
    permissions: me.permissions,
    isSuperAdmin: me.isSuperAdmin,
    mustChangePassword: me.mustChangePassword,
  }))
