import { computed } from 'vue'

import { useAuthStore } from '@/shared/stores/authStore'

// The cards of the Management page. A card shows only to a user with an organization who holds
// one of its permission keys (the super admin has no organization, so none). A card is added here
// when its screen is built.
const ENTRIES = [
  { id: 'users', permissions: ['user:read'], path: '/m/manage/users', labelKey: 'manage.users' },
]

export function useManagementEntries() {
  const auth = useAuthStore()
  return computed(() =>
    auth.canUseOrganization
      ? ENTRIES.filter(entry => entry.permissions.some(key => auth.hasPermission(key)))
      : [],
  )
}