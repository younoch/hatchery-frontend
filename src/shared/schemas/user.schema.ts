import { z } from 'zod'

// Users of the signed-in admin's organization (UserResponseDto in openapi.json).
export const roleRefSchema = z.object({ id: z.string(), name: z.string() })

export const managedUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  isActive: z.boolean(),
  mustChangePassword: z.boolean(),
  organizationId: z.string().nullable(),
  role: roleRefSchema.nullable(),
  createdAt: z.string(),
})

export const paginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
})

export const userListSchema = z.object({
  items: z.array(managedUserSchema),
  meta: paginationMetaSchema,
})

export const messageSchema = z.object({ message: z.string() })

export type ManagedUser = z.infer<typeof managedUserSchema>
export type PaginationMeta = z.infer<typeof paginationMetaSchema>

// The rules (username, length, password) belong to the backend and are not copied here: the app
// shows the codes it answers with (`invalid_username`, `username_taken`, `weak_password`, ...).
export interface CreateUserInput {
  username: string
  email: string
  name?: string
  roleId: string
  temporaryPassword: string
}

export interface UpdateUserInput {
  roleId?: string
  isActive?: boolean
  name?: string
}