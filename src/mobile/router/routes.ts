import type { RouteRecordRaw } from 'vue-router'
import PlaceholderView from '@/mobile/views/PlaceholderView.vue'

export const mobileRoutes: RouteRecordRaw[] = [
  {
    path: '/m/:pathMatch(.*)*',
    component: PlaceholderView,
  },
]
