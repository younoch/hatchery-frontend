import type { RouteRecordRaw } from 'vue-router'
import MobileShell from '@/mobile/layouts/MobileShell.vue'
import PlaceholderView from '@/mobile/views/PlaceholderView.vue'
import WaterView from '@/mobile/views/WaterView.vue'

export const mobileRoutes: RouteRecordRaw[] = [
  {
    path: '/m',
    component: MobileShell,
    redirect: '/m/water',
    children: [
      {
        path: 'water',
        component: WaterView,
        meta: { titleKey: 'nav.waterQuality' },
      },
      {
        path: ':pathMatch(.*)*',
        component: PlaceholderView,
        meta: { titleKey: 'nav.waterQuality' },
      },
    ],
  },
]
