import { authedRequest } from '@/shared/api/authedRequest'
import { organizationRoleListSchema } from '@/shared/schemas/organizationRole.schema'

// The roles of the signed-in user's organization, for the create-user form and the role screen.
export function fetchOrganizationRoles() {
  return authedRequest({ path: '/organization-roles', schema: organizationRoleListSchema })
}