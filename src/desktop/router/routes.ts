import type { RouteRecordRaw } from 'vue-router'
import PlaceholderView from '@/desktop/views/PlaceholderView.vue'

export const desktopRoutes: RouteRecordRaw[] = [
  {
    path: '/d/:pathMatch(.*)*',
    component: PlaceholderView,
  },
]
