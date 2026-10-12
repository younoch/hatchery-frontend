import type { RouteRecordRaw } from 'vue-router'

export const desktopRoutes: RouteRecordRaw[] = [
  {
    path: '/d/:pathMatch(.*)*',
    component: () => import('@/desktop/views/PlaceholderView.vue'),
  },
]
