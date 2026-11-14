<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import MobileAppBar from '@/mobile/components/nav/MobileAppBar.vue'
import BottomTabBar from '@/mobile/components/nav/BottomTabBar.vue'
import ClearCacheConfirmSheet from '@/shared/components/ClearCacheConfirmSheet.vue'
import LogoutConfirmSheet from '@/shared/components/LogoutConfirmSheet.vue'
import ToastHost from '@/shared/components/ToastHost.vue'
import { useOnlineStatus } from '@/shared/composables/useOnlineStatus'

const { t } = useI18n()
const { isOnline } = useOnlineStatus()
</script>

<template>
  <div class="flex h-dvh flex-col">
    <MobileAppBar />

    <div v-if="!isOnline" role="status"
      class="flex items-start gap-s-2 border-b border-border bg-warning-soft px-s-4 py-s-2 text-caption text-sync-pending">
      <svg class="h-[1rem] w-[1rem] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.01" />
      </svg>
      <span>{{ t('network.offlineBanner') }}</span>
    </div>

    <main class="min-h-[0] flex-1 overflow-y-auto">
      <router-view />
    </main>
    <BottomTabBar />
    <ToastHost />
    <LogoutConfirmSheet />
    <ClearCacheConfirmSheet />
  </div>
</template>
