import { z } from 'zod'

// Only "filled in" is checked here; the name rules (length, unique in the organization) belong to
// the backend, which answers with a code that the form shows next to the field.
export const tankFormSchema = z.object({
  name: z.string().trim().min(1, 'validation.required'),
  status: z.enum(['active', 'inactive']),
})

export type TankFormValues = z.infer<typeof tankFormSchema>