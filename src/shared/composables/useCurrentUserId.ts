import { useAuthStore } from '@/shared/stores/authStore'

// Readings are always written and read under the signed-in user. A missing user is a bug
// (the route guard keeps anonymous users out), so it throws instead of falling back.
export function requireUserId(): string {
  const id = useAuthStore().user?.id
  if (!id) throw new Error('No signed-in user')
  return id
}