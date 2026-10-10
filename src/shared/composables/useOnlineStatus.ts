import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

export function useOnlineStatus() {
  const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

  const update = () => {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    update()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })

  return {
    isOnline: readonly(isOnline),
  }
}
