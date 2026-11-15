import { z } from 'zod'

// Only "filled in" is checked here; the backend's rules answer as codes next to the field.
export const updateUserFormSchema = z.object({
  name: z.string().trim(),
  roleId: z.string().min(1, 'validation.required'),
  status: z.enum(['active', 'inactive']),
})

export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>