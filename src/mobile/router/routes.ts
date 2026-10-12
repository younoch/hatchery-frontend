import type { RouteRecordRaw } from 'vue-router'
import MobileShell from '@/mobile/layouts/MobileShell.vue'

export const mobileRoutes: RouteRecordRaw[] = [
  {
    path: '/m',
    component: MobileShell,
    redirect: '/m/water',
    children: [
      {
        path: 'water',
        component: () => import('@/mobile/views/WaterView.vue'),
        meta: { titleKey: 'nav.waterQuality' },
      },
      {
        path: ':pathMatch(.*)*',
        component: () => import('@/mobile/views/PlaceholderView.vue'),
        meta: { titleKey: 'nav.waterQuality' },
      },
    ],
  },
]
