import { ref } from 'vue'

export interface AppError {
  message: string
  source?: string
}

const _error = ref<AppError | null>(null)

export function useErrorStore() {
  function report(err: unknown, source?: string) {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error'
    _error.value = { message, source }
    if (import.meta.env.DEV) {
      console.error(`[${source ?? 'app'}]`, err)
    }
  }

  function clear() {
    _error.value = null
  }

  return { error: _error, report, clear }
}
