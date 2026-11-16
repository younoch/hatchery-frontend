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
        path: 'manage',
        component: () => import('@/mobile/views/ManageView.vue'),
        meta: { titleKey: 'manage.title' },
      },
      {
        path: 'manage/users',
        component: () => import('@/mobile/views/UsersView.vue'),
        meta: { titleKey: 'manage.usersTitle' },
      },
      {
        path: 'manage/users/new',
        component: () => import('@/mobile/views/UserCreateView.vue'),
        meta: { titleKey: 'manage.newUserTitle' },
      },
      {
        path: 'manage/users/:id',
        component: () => import('@/mobile/views/UserEditView.vue'),
        meta: { titleKey: 'manage.usersTitle' },
      },
      {
        path: 'manage/tanks',
        component: () => import('@/mobile/views/TanksView.vue'),
        meta: { titleKey: 'manage.tanksTitle' },
      },
      {
        path: 'manage/tanks/new',
        component: () => import('@/mobile/views/TankFormView.vue'),
        meta: { titleKey: 'manage.newTankTitle' },
      },
      {
        path: 'manage/tanks/:id',
        component: () => import('@/mobile/views/TankFormView.vue'),
        meta: { titleKey: 'manage.editTankTitle' },
      },
      {
        path: 'manage/roles',
        component: () => import('@/mobile/views/RolesView.vue'),
        meta: { titleKey: 'manage.rolesTitle' },
      },
      {
        path: 'manage/tanks/new',
        component: () => import('@/mobile/views/PlaceholderView.vue'),
        meta: { titleKey: 'manage.tanksTitle' },
      },
      {
        path: 'manage/tanks/:id',
        component: () => import('@/mobile/views/PlaceholderView.vue'),
        meta: { titleKey: 'manage.tanksTitle' },
      },
      {
        path: ':pathMatch(.*)*',
        component: () => import('@/mobile/views/PlaceholderView.vue'),
        meta: { titleKey: 'nav.waterQuality' },
      },
    ],
  },
]
