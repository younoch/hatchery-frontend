import { z } from 'zod'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  roleName: string | null
  permissions: string[]
  isSuperAdmin: boolean
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

// Error envelope: validation errors carry an object in `message`, others a string.
export const errorEnvelopeSchema = z.object({
  success: z.literal(false),
  statusCode: z.number(),
  path: z.string(),
  message: z.union([
    z.string(),
    z.object({
      statusCode: z.number(),
      message: z.array(z.string()),
      error: z.string(),
    }),
  ]),
  timestamp: z.string(),
})
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>

// POST /auth/login and POST /auth/refresh (the refresh token is a cookie, never in the body)
// Verified 2026-10-16: the body is `data.access_token` (real output).
export const accessTokenSchema = z.object({
  access_token: z.string().min(1),
})

// GET /user/me
// Verified 2026-10-15: `role` is `null` for a user without a role.
// Verified 2026-10-15: `isSuperAdmin` is not returned yet (backend task 7).
export const meSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    role: z
      .object({
        name: z.string(),
        permissions: z.array(z.string()),
      })
      .nullish(),
    isSuperAdmin: z.boolean().optional(),
  })
  .transform(
    (me): AuthUser => ({
      id: me.id,
      email: me.email,
      roleName: me.role?.name ?? null,
      permissions: me.role?.permissions ?? [],
      isSuperAdmin: me.isSuperAdmin ?? false,
    }),
  )