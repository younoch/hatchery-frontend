// The organization-level permission keys the role screen shows (OrgPermissionKey in openapi.json),
// in the order they are listed. `reading:read-all` is reserved and no endpoint uses it yet, so it
// is not shown. The labels are in the locale files under `permission.*`.
export const ORG_PERMISSIONS = [
  { key: 'user:read', labelKey: 'permission.userRead' },
  { key: 'user:create', labelKey: 'permission.userCreate' },
  { key: 'user:write', labelKey: 'permission.userWrite' },
  { key: 'user:reset-password', labelKey: 'permission.userResetPassword' },
  { key: 'tank:create', labelKey: 'permission.tankCreate' },
  { key: 'tank:write', labelKey: 'permission.tankWrite' },
  { key: 'organization-role:write', labelKey: 'permission.organizationRoleWrite' },
  { key: 'reading:create', labelKey: 'permission.readingCreate' },
] as const

const SHOWN = new Set<string>(ORG_PERMISSIONS.map(item => item.key))

// A key the screen shows. The others (the reserved `reading:read-all`) are kept as they are when a
// role is saved, so a save never drops a key the admin cannot see.
export function isShownPermission(key: string): boolean {
  return SHOWN.has(key)
}

// How many of a role's keys the screen shows (the reserved key is left out).
export function shownPermissionCount(permissions: readonly string[]): number {
  return permissions.filter(key => SHOWN.has(key)).length
}
