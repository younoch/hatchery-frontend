<script setup lang="ts">
import { liveQuery } from 'dexie'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import WaterEntryView from '@/mobile/views/WaterEntryView.vue'
import WaterHistoryView from '@/mobile/views/WaterHistoryView.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import Tabs from '@/shared/components/ui/Tabs.vue'
import { countUnsyncedReadings } from '@/shared/storage/readings'
import { useErrorStore } from '@/shared/stores/errorStore'

const { t } = useI18n()
const { report } = useErrorStore()
const tab = ref('new')
const unsyncedCount = ref(0)
const items = computed(() => [
  { label: t('water.tabNew'), value: 'new' },
  {
    label:
      unsyncedCount.value > 0
        ? t('water.tabHistoryCount', { count: unsyncedCount.value })
        : t('water.tabHistory'),
    value: 'history',
  },
])

let unsubscribe: (() => void) | undefined

onMounted(() => {
  const subscription = liveQuery(() => countUnsyncedReadings()).subscribe({
    next: count => {
      unsyncedCount.value = count
    },
    error: err => {
      report(err, 'WaterView:liveQuery')
    },
  })
  unsubscribe = () => subscription.unsubscribe()
})

onBeforeUnmount(() => unsubscribe?.())
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
