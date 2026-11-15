import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { ManagedUser, PaginationMeta } from '@/shared/schemas/user.schema'

// The users the admin has loaded, shared by the list and the edit page (the backend has no call
// for a single user). Not persisted: after a reload the edit page sends the admin to the list.
export const useUserStore = defineStore('users', () => {
  const items = ref<ManagedUser[]>([])
  const meta = ref<PaginationMeta | null>(null)

  function find(id: string): ManagedUser | undefined {
    return items.value.find(user => user.id === id)
  }

  function replace(user: ManagedUser): void {
    items.value = items.value.map(item => (item.id === user.id ? user : item))
  }

  function reset(): void {
    items.value = []
    meta.value = null
  }

  return { items, meta, find, replace, reset }
})