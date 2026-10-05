import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export type DeviceClass = 'mobile' | 'desktop'

const STORAGE_KEY = 'hatchery-device-class'

function detectDeviceClass(): DeviceClass {
  const isAndroidPhone =
    /Android/i.test(navigator.userAgent) && window.matchMedia('(width < 48rem)').matches

  return isAndroidPhone ? 'mobile' : 'desktop'
}

export function getInitialDeviceClass(): DeviceClass {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'mobile' || stored === 'desktop') {
      return stored
    }
  } catch {
    // Ignore localStorage errors
  }

  return detectDeviceClass()
}

export function setPreferredDeviceClass(deviceClass: DeviceClass): void {
  try {
    localStorage.setItem(STORAGE_KEY, deviceClass)
  } catch {
    // Ignore localStorage errors
  }
}

export function useDeviceClass() {
  const route = useRoute()
  const router = useRouter()

  const deviceClass = computed<DeviceClass>(() =>
    route.path === '/m' || route.path.startsWith('/m/') ? 'mobile' : 'desktop'
  )

  const toggleDeviceClass = async () => {
    const nextDeviceClass = deviceClass.value === 'mobile' ? 'desktop' : 'mobile'
    const unprefixedPath = route.path.replace(/^\/[md](?=\/|$)/, '') || '/'
    const prefix = nextDeviceClass === 'mobile' ? 'm' : 'd'

    setPreferredDeviceClass(nextDeviceClass)
    await router.replace({
      path: `/${prefix}${unprefixedPath}`,
      query: route.query,
      hash: route.hash,
    })
  }

  return {
    deviceClass,
    toggleDeviceClass,
  }
}
