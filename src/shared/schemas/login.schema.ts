import { z } from 'zod'

// Messages are i18n keys, like the water schema. The password rule is not checked here on
// purpose: the backend owns it, and a wrong password must read as "wrong credentials".
export const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'validation.required').email('validation.email.invalid'),
  password: z.string().min(1, 'validation.required'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>