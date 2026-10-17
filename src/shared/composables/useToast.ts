import { ref } from 'vue'

export type ToastVariant = 'error' | 'success' | 'info'

export interface ToastMessage {
  id: number
  variant: ToastVariant
  messageKey: string
  params?: Record<string, unknown>
}

// Auto-dismiss time per variant: errors stay longer so they can be read.
export const TOAST_DURATION_MS: Record<ToastVariant, number> = {
  error: 6_000,
  success: 3_000,
  info: 4_000,
}

// Module scope, like errorStore: usable from components, the router and main.ts.
const current = ref<ToastMessage | null>(null)
let nextId = 1

function show(variant: ToastVariant, messageKey: string, params?: Record<string, unknown>) {
  // One toast at a time: a new one replaces the old one.
  current.value = { id: nextId++, variant, messageKey, params }
}

function dismiss() {
  current.value = null
}

export function useToast() {
  return {
    current,
    dismiss,
    error: (key: string, params?: Record<string, unknown>) => show('error', key, params),
    success: (key: string, params?: Record<string, unknown>) => show('success', key, params),
    info: (key: string, params?: Record<string, unknown>) => show('info', key, params),
  }
}