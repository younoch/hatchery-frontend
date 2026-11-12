<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Button from '@/shared/components/ui/Button.vue'
import Sheet from '@/shared/components/ui/Sheet.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import { useLogout } from '@/shared/composables/useLogout'

const { t } = useI18n()
const { confirmOpen, unsentCount, loggingOut, confirmLogout } = useLogout()
</script>

<template>
  <Sheet
    v-model:open="confirmOpen"
    :title="t('auth.logoutConfirm.title')"
    :description="t('auth.logoutConfirm.message', { count: unsentCount })"
    content-class="h-auto"
  >
    <template #trigger>
      <span class="hidden" aria-hidden="true" />
    </template>
    <FieldGrid :cols="1">
      <Button :disabled="loggingOut" @click="confirmOpen = false">
        {{ t('auth.logoutConfirm.cancel') }}
      </Button>
      <Button variant="red-outline" :disabled="loggingOut" @click="confirmLogout">
        {{ t('auth.logoutConfirm.confirm') }}
      </Button>
    </FieldGrid>
  </Sheet>
</template>