import type { RouteRecordRaw } from 'vue-router'
import MobileShell from '@/mobile/layouts/MobileShell.vue'
import PlaceholderView from '@/mobile/views/PlaceholderView.vue'

export const mobileRoutes: RouteRecordRaw[] = [
  {
    path: '/m',
    component: MobileShell,
    children: [
      {
        path: ':pathMatch(.*)*',
        component: PlaceholderView,
        meta: { titleKey: 'nav.waterQuality' },
      },
    ],
  },
]
