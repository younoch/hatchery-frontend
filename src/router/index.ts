import { createRouter, createWebHistory } from 'vue-router'
import { useErrorStore } from '@/shared/stores/errorStore'
import { desktopRoutes } from '@/desktop/router/routes'
import { mobileRoutes } from '@/mobile/router/routes'
import { getInitialDeviceClass } from '@/shared/composables/useDeviceClass'
import { useAuthStore } from '@/shared/stores/authStore'

const devRoutes = import.meta.env.DEV
  ? [
      { path: '/dev/styleguide', component: () => import('@/mobile/views/StyleguideView.vue') },
      {
        path: '/dev/styleguide/heavy',
        component: () => import('@/mobile/views/StyleguideHeavyView.vue'),
      },
    ]
  : []

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...mobileRoutes,
    ...desktopRoutes,
    ...devRoutes,
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/shared/components/DevicePlaceholderView.vue'),
    },
  ],
})

router.onError(err => {
  const { report } = useErrorStore()
  // Chunk load failures (lazy import 404 after a new deploy)
  const isChunkError =
    err?.message?.includes('Failed to fetch dynamically imported module') ||
    err?.message?.includes('Importing a module script failed')
  report(err, isChunkError ? 'router:chunk-load' : 'router')
  if (isChunkError) {
    // Force a full reload so the browser fetches the new chunk.
    window.location.reload()
  }
})

router.beforeEach( async (to) => {
  const isPrefixed =
    to.path === '/m' || to.path.startsWith('/m/') || to.path === '/d' || to.path.startsWith('/d/')
  const isDevRoute = import.meta.env.DEV && to.path.startsWith('/dev/')

  if (!isPrefixed && !isDevRoute) {
    const deviceClass = getInitialDeviceClass()
    const path = to.path === '/' ? '/' : to.fullPath
    const prefix = deviceClass === 'mobile' ? 'm' : 'd'
    return `/${prefix}${path}`
  }

  if (isDevRoute) return true

  const auth = useAuthStore()
  if (auth.status === 'unknown') {
    await auth.bootstrap()
  }

  const isPublic = to.meta.public === true
  if (auth.status === 'anonymous' && !isPublic) {
    return { path: '/m/login', query: { redirect: to.fullPath } }
  }
  if (auth.status === 'authenticated' && isPublic) {
    return '/m/water'
  }
  return true
})
