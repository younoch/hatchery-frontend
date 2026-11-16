import { authedRequest } from '@/shared/api/authedRequest'
import {
  organizationRoleListSchema,
  organizationRoleSchema,
} from '@/shared/schemas/organizationRole.schema'

// The roles of the signed-in user's organization, for the create-user form and the role screen.
export function fetchOrganizationRoles() {
  return authedRequest({ path: '/organization-roles', schema: organizationRoleListSchema })
}

// `id` is the organization role row id (not `roleId`). `permissions` is the full new list.
export function updateOrganizationRole(id: string, permissions: string[]) {
  return authedRequest({
    method: 'PATCH',
    path: `/organization-roles/${id}`,
    body: { permissions },
    schema: organizationRoleSchema,
  })
}
