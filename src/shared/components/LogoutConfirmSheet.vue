<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ConfirmSheet from '@/shared/components/ConfirmSheet.vue'
import { useLogout } from '@/shared/composables/useLogout'

const { t } = useI18n()
const { confirmOpen, unsentCount, loggingOut, confirmLogout } = useLogout()
</script>

<template>
  <ConfirmSheet
    v-model:open="confirmOpen"
    :title="t('auth.logoutConfirm.title')"
    :message="t('auth.logoutConfirm.message', { count: unsentCount })"
    :confirm-label="t('auth.logoutConfirm.confirm')"
    :cancel-label="t('auth.logoutConfirm.cancel')"
    :busy="loggingOut"
    @confirm="confirmLogout"
  />
</template>