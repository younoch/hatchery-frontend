import type { AuthUser, LoginCredentials } from '@/shared/schemas/auth.schema'

// Every method returns plain data and throws ApiError. The access token is returned to the
// caller (the auth store keeps it in memory); the adapter never stores it.
export interface AuthAdapter {
  login(credentials: LoginCredentials): Promise<string>
  refresh(): Promise<string>
  logout(): Promise<void>
  fetchMe(accessToken: string): Promise<AuthUser>
}