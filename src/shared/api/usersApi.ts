import { authedRequest } from '@/shared/api/authedRequest'
import {
  managedUserSchema,
  messageSchema,
  userListSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/shared/schemas/user.schema'

// The organization is taken from the token: the admin never sends `organizationId`.
export function fetchUsers(options: { page: number; pageSize: number }) {
  const query = new URLSearchParams({
    page: String(options.page),
    pageSize: String(options.pageSize),
  })
  return authedRequest({ path: `/users?${query.toString()}`, schema: userListSchema })
}

export function createUser(input: CreateUserInput) {
  return authedRequest({ method: 'POST', path: '/users', body: input, schema: managedUserSchema })
}

export function updateUser(id: string, input: UpdateUserInput) {
  return authedRequest({
    method: 'PATCH',
    path: `/users/${id}`,
    body: input,
    schema: managedUserSchema,
  })
}

// Sets a temporary password; the backend also ends the user's sessions (B→F-35).
export function resetUserPassword(id: string, temporaryPassword: string) {
  return authedRequest({
    method: 'POST',
    path: `/users/${id}/reset-password`,
    body: { temporaryPassword },
    schema: messageSchema,
  })
}