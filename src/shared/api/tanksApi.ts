import { authedRequest } from '@/shared/api/authedRequest'
import { tankListSchema, tankSchema } from '@/shared/schemas/tank.schema'

// The tanks of the signed-in user's organization, inactive ones included. A user without an
// organization gets 403 `no_organization`: the caller must not call this for such a user.
export function fetchTanks() {
  return authedRequest({ path: '/tanks', schema: tankListSchema })
}

// The organization comes from the token: the admin never sends `organizationId`.
export function createTank(input: { name: string }) {
  return authedRequest({ method: 'POST', path: '/tanks', body: input, schema: tankSchema })
}

export function updateTank(id: string, input: { name?: string; isActive?: boolean }) {
  return authedRequest({
    method: 'PATCH',
    path: `/tanks/${id}`,
    body: input,
    schema: tankSchema,
  })
}
