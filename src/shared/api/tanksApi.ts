import { authedRequest } from '@/shared/api/authedRequest'
import { tankListSchema } from '@/shared/schemas/tank.schema'

// The tanks of the signed-in user's organization, inactive ones included. A user without an
// organization gets 403 `no_organization`: the caller must not call this for such a user.
export function fetchTanks() {
  return authedRequest({ path: '/tanks', schema: tankListSchema })
}