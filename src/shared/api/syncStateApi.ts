import { authedRequest } from '@/shared/api/authedRequest'
import { syncStateSchema } from '@/shared/schemas/syncState.schema'

// Any member of an organization may call it; a user without one gets 403 `no_organization`, so the
// caller must not ask for such a user.
export function fetchSyncState() {
  return authedRequest({ path: '/sync/state', schema: syncStateSchema })
}