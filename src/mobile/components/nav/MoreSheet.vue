<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '@/shared/components/ui/Button.vue'
import Sheet from '@/shared/components/ui/Sheet.vue'
import { useDeviceClass } from '@/shared/composables/useDeviceClass'

defineProps<{ bottomOffset?: number }>()

const { t } = useI18n()
const { toggleDeviceClass } = useDeviceClass()
const open = ref(false)

function switchDevice() {
  open.value = false
  toggleDeviceClass()
}
</script>

<template>
  <Sheet v-model:open="open" :title="t('nav.more')" :bottom-offset="bottomOffset">
    <template #trigger>
      <slot name="trigger" />
    </template>
    <Button variant="secondary" class="justify-start" @click="switchDevice">
      {{ t('device.switchToDesktop') }}
    </Button>
  </Sheet>
</template>
