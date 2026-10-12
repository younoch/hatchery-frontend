<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import WaterEntryView from '@/mobile/views/WaterEntryView.vue'
import WaterHistoryView from '@/mobile/views/WaterHistoryView.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import Tabs from '@/shared/components/ui/Tabs.vue'

const { t } = useI18n()

const tab = ref('new')
const items = computed(() => [
  { label: t('water.tabNew'), value: 'new' },
  { label: t('water.tabHistory'), value: 'history' },
])
</script>

<template>
  <div class="flex min-h-[100%] flex-col">
    <PageBody>
      <Tabs v-model="tab" :items="items" />
    </PageBody>

    <!-- v-show, not v-if: the form stays mounted so typed values and confirmations survive a tab switch -->
    <div v-show="tab === 'new'" class="flex flex-1 flex-col">
      <WaterEntryView />
    </div>
    <div v-show="tab === 'history'" class="flex-1">
      <WaterHistoryView />
    </div>
  </div>
</template>
