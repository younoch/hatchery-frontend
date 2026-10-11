import type { RouteRecordRaw } from 'vue-router'
import MobileShell from '@/mobile/layouts/MobileShell.vue'
import PlaceholderView from '@/mobile/views/PlaceholderView.vue'
import WaterEntryView from '@/mobile/views/WaterEntryView.vue'

export const mobileRoutes: RouteRecordRaw[] = [
  {
    path: '/m',
    component: MobileShell,
    redirect: '/m/water',
    children: [
      {
        path: 'water',
        component: WaterEntryView,
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
