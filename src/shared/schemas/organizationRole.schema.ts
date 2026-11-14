import { z } from 'zod'

// GET /organization-roles (OrganizationRoleResponseDto). The `admin` row has `editable: false`.
export const organizationRoleSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  name: z.string(),
  permissions: z.array(z.string()),
  editable: z.boolean(),
})

export const organizationRoleListSchema = z.array(organizationRoleSchema)

export type OrganizationRole = z.infer<typeof organizationRoleSchema>