import type { ManagedUser } from '@/shared/schemas/user.schema'

// The organization's admin is changed and reset by the super admin only (B→F-35: 403
// `permission_denied`, `org_admin_protected`). This is for the screens' sake; the backend enforces it.
export function isOrgAdmin(user: ManagedUser): boolean {
  return user.role?.name === 'admin'
}