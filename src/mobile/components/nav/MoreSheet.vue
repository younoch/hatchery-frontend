<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import Button from '@/shared/components/ui/Button.vue'
import Sheet from '@/shared/components/ui/Sheet.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import { useDeviceClass } from '@/shared/composables/useDeviceClass'
import { usePwa } from '@/shared/composables/usePwa'
import { useAuthStore } from '@/shared/stores/authStore'

defineProps<{ bottomOffset?: number }>()

const { t } = useI18n()
const { toggleDeviceClass } = useDeviceClass()
const { offlineReady, canInstall, install } = usePwa()
const auth = useAuthStore()
const router = useRouter()
const open = ref(false)

function switchDevice() {
  open.value = false
  toggleDeviceClass()
}

async function logout() {
  open.value = false
  await auth.logout()
  await router.replace('/m/login')
}
</script>

<template>
  <Sheet v-model:open="open" :title="t('nav.more')" :bottom-offset="bottomOffset">
    <template #trigger>
      <slot name="trigger" />
    </template>
    <FieldGrid :cols="1">
      <p v-if="offlineReady" class="flex items-center gap-s-1 text-caption font-medium text-sync-synced">
        <svg class="h-[0.8125rem] w-[0.8125rem] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12l5 5 9-10" />
        </svg>
        <span>{{ t('pwa.offlineReady') }}</span>
      </p>
      <Button v-if="canInstall" variant="secondary" class="justify-start" @click="install">
        {{ t('pwa.install') }}
      </Button>
      <Button variant="secondary" class="justify-start" @click="switchDevice">
        {{ t('device.switchToDesktop') }}
      </Button>
      + <Button variant="red-outline" class="justify-start" @click="logout">
        + {{ t('auth.logout') }}
        + </Button>
    </FieldGrid>
  </Sheet>
</template>
