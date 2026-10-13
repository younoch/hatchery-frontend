import { computed, ref, shallowRef } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const offlineReady = ref(false)
// shallowRef: a reactive proxy around a native event breaks event.prompt().
const installEvent = shallowRef<BeforeInstallPromptEvent | null>(null)

// Call once at startup. The service worker itself is registered by the PWA plugin.
export function initPwa() {
  if ('serviceWorker' in navigator) {
    // Resolves when a service worker is active, which is after the app shell is precached.
    // It also resolves on later visits, unlike the plugin's onOfflineReady callback.
    void navigator.serviceWorker.ready.then(() => {
      offlineReady.value = true
    })
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault()
    installEvent.value = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    installEvent.value = null
  })
}

export function usePwa() {
  const canInstall = computed(() => installEvent.value !== null)

  async function install() {
    const event = installEvent.value
    if (!event) return
    installEvent.value = null // the event can be used only once
    await event.prompt()
    await event.userChoice
  }

  return { offlineReady, canInstall, install }
}
