import { createRouter, createWebHistory } from 'vue-router'
import { desktopRoutes } from '@/desktop/router/routes'
import { mobileRoutes } from '@/mobile/router/routes'
import DevicePlaceholderView from '@/shared/components/DevicePlaceholderView.vue'
import { getInitialDeviceClass } from '@/shared/composables/useDeviceClass'

const devRoutes = import.meta.env.DEV
  ? [{ path: '/dev/styleguide', component: () => import('@/mobile/views/StyleguideView.vue') }]
  : []

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...mobileRoutes,
    ...desktopRoutes,
    ...devRoutes,
    {
      path: '/:pathMatch(.*)*',
      component: DevicePlaceholderView,
    },
  ],
})

router.beforeEach(to => {
  const isPrefixed =
    to.path === '/m' || to.path.startsWith('/m/') || to.path === '/d' || to.path.startsWith('/d/')
  const isDevRoute = import.meta.env.DEV && to.path.startsWith('/dev/')

  if (isPrefixed || isDevRoute) {
    return true
  }

  const deviceClass = getInitialDeviceClass()
  const path = to.path === '/' ? '/' : to.fullPath
  const prefix = deviceClass === 'mobile' ? 'm' : 'd'

  return `/${prefix}${path}`
})
