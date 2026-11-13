import { z } from 'zod'

// GET /tanks (TankResponseDto in openapi.json). The server orders the list by name.
export const tankSchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
})

export const tankListSchema = z.array(tankSchema)

export type ApiTank = z.infer<typeof tankSchema>