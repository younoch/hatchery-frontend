// Only in-app mobile or desktop paths are allowed, so a crafted ?redirect= cannot leave the app.
export function safeRedirect(value: unknown, fallback = '/m/water'): string {
  if (typeof value !== 'string') return fallback
  return /^\/(m|d)(\/|$)/.test(value) ? value : fallback
}