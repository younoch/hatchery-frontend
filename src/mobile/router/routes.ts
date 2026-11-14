import type { RouteRecordRaw } from 'vue-router'
import MobileShell from '@/mobile/layouts/MobileShell.vue'

export const mobileRoutes: RouteRecordRaw[] = [
  {
    path: '/m/login',
    component: () => import('@/mobile/views/LoginView.vue'),
    meta: { public: true, titleKey: 'auth.login.title' },
  },
  {
    path: '/m/change-password',
    component: () => import('@/mobile/views/ChangePasswordView.vue'),
    meta: { titleKey: 'auth.changePassword.title' },
  },
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
        path: 'water/edit/:id',
        component: () => import('@/mobile/views/WaterEditView.vue'),
        meta: { titleKey: 'water.editTitle' },
      },
      {
        path: ':pathMatch(.*)*',
        component: () => import('@/mobile/views/PlaceholderView.vue'),
        meta: { titleKey: 'nav.waterQuality' },
      },
    ],
  },
]
