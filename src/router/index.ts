import { createRouter, createWebHistory } from 'vue-router'
import { desktopRoutes } from '@/desktop/router/routes'
import { mobileRoutes } from '@/mobile/router/routes'
import DevicePlaceholderView from '@/shared/components/DevicePlaceholderView.vue'
import { getInitialDeviceClass } from '@/shared/composables/useDeviceClass'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...mobileRoutes,
    ...desktopRoutes,
    {
      path: '/:pathMatch(.*)*',
      component: DevicePlaceholderView,
    },
  ],
})

router.beforeEach(to => {
  const isPrefixed =
    to.path === '/m' || to.path.startsWith('/m/') || to.path === '/d' || to.path.startsWith('/d/')

  if (isPrefixed) {
    return true
  }

  const deviceClass = getInitialDeviceClass()
  const path = to.path === '/' ? '/' : to.fullPath
  const prefix = deviceClass === 'mobile' ? 'm' : 'd'

  return `/${prefix}${path}`
})
