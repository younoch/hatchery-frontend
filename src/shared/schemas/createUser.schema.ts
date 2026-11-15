import { z } from 'zod'

// Only "filled in" is checked here. The rules for a username, an email and a password belong to
// the backend, which answers with codes that the form shows next to the field.
export const createUserFormSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, 'validation.required'),
  email: z.string().trim().min(1, 'validation.required'),
  name: z.string().trim(),
  roleId: z.string().min(1, 'validation.required'),
  temporaryPassword: z.string().min(1, 'validation.required'),
})

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>