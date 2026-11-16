import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { OrganizationRole } from '@/shared/schemas/organizationRole.schema'

// The organization's roles the admin has loaded, shared by the role list and the role page (the
// backend has no call for a single role). Not persisted.
export const useRoleStore = defineStore('roles', () => {
  const items = ref<OrganizationRole[]>([])

  function find(id: string): OrganizationRole | undefined {
    return items.value.find(role => role.id === id)
  }

  function replace(role: OrganizationRole): void {
    items.value = items.value.map(item => (item.id === role.id ? role : item))
  }

  function reset(): void {
    items.value = []
  }

  return { items, find, replace, reset }
})