import { z } from 'zod'

// Messages are i18n keys, like the water schema. The password rule is not checked here on
// purpose: the backend owns it, and a wrong password must read as "wrong credentials".
export const loginFormSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, 'validation.required'),
  password: z.string().min(1, 'validation.required'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
