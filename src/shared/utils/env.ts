import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .url()
    .transform(value => value.replace(/\/+$/, '')),
})

const result = envSchema.safeParse(import.meta.env)

if (!result.success) {
  const details = result.error.issues
    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
  throw new Error(`Invalid environment variables: ${details}`)
}

const env = result.data

export default env
