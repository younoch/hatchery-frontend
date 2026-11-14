<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ConfirmSheet from '@/shared/components/ConfirmSheet.vue'
import { useClearCache } from '@/shared/composables/useClearCache'

const { t } = useI18n()
const { confirmOpen, unsentCount, working, clearAndReload } = useClearCache()
</script>

<template>
  <ConfirmSheet
    v-model:open="confirmOpen"
    :title="t('cache.confirmTitle')"
    :message="t('cache.confirmMessage', { count: unsentCount })"
    :confirm-label="t('cache.confirm')"
    :cancel-label="t('cache.cancel')"
    :busy="working"
    @confirm="clearAndReload"
  />
</template>