import { readonly, ref } from 'vue'

// TODO(Step 22): replace this sample value with real notification data.
const unreadCount = ref(3)

export function useNotificationCount() {
  return {
    unreadCount: readonly(unreadCount),
  }
}
