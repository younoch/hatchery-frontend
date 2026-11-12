import { z } from 'zod'

// Messages are i18n keys, like the login schema. The length and character rules belong to the
// backend and are not checked here; "the two new passwords are the same" is the only
// frontend rule.
export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'validation.required'),
    newPassword: z.string().min(1, 'validation.required'),
    confirmPassword: z.string().min(1, 'validation.required'),
  })
  .refine(values => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.passwordMismatch',
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>