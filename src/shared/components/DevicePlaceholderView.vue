<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDeviceClass } from '@/shared/composables/useDeviceClass'

const { t } = useI18n()
const { deviceClass, toggleDeviceClass } = useDeviceClass()
</script>

<template>
  <main class="grid min-h-screen place-content-center gap-s-4 text-center">
    <h1 class="text-h1">
      {{
        deviceClass === 'mobile' ? t('device.mobilePlaceholder') : t('device.desktopPlaceholder')
      }}
    </h1>
    <button
      class="h-control rounded-control border border-primary px-s-4 text-label text-primary"
      type="button"
      @click="toggleDeviceClass"
    >
      {{ deviceClass === 'mobile' ? t('device.switchToDesktop') : t('device.switchToMobile') }}
    </button>
  </main>
</template>
