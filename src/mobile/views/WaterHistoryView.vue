<script setup lang="ts">
import { liveQuery } from 'dexie'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Card from '@/shared/components/Card.vue'
import Metric from '@/shared/components/Metric.vue'
import StatusBadge from '@/shared/components/StatusBadge.vue'
import Button from '@/shared/components/ui/Button.vue'
import CardList from '@/shared/components/layout/CardList.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import { formatReadingTime } from '@/shared/lib/datetime'
import { rejectionMessageKey } from '@/shared/lib/rejection'
import type { Reading } from '@/shared/storage/db'
import { listReadings, retryFailedReading } from '@/shared/storage/readings'
import { requireUserId } from '@/shared/composables/useCurrentUserId'
import { useErrorStore } from '@/shared/stores/errorStore'
import { useTankStore } from '@/shared/stores/tankStore'

const { t, locale } = useI18n()
const { report } = useErrorStore()
const tankStore = useTankStore()

const METRICS = [
  { name: 'ph', labelKey: 'water.ph', unit: undefined },
  { name: 'temperatureC', labelKey: 'water.temperature', unit: '°C' },
  { name: 'salinityPpt', labelKey: 'water.salinity', unit: 'ppt' },
  { name: 'oxygenMgL', labelKey: 'water.oxygen', unit: 'mg/L' },
] as const

const readings = ref<Reading[]>([])
let unsubscribe: (() => void) | undefined

const tankName = (id: string) => tankStore.nameOf(id) ?? t('water.unknownTank')

// liveQuery re-runs when the readings table changes, so a new save shows up here at once.
onMounted(() => {
  const subscription = liveQuery(() => listReadings(requireUserId())).subscribe({
    next: rows => {
      readings.value = rows
    },
    error: err => {
      report(err, 'WaterHistoryView:liveQuery')
    },
  })
  unsubscribe = () => subscription.unsubscribe()
})

onBeforeUnmount(() => unsubscribe?.())
</script>

<template>
  <PageBody>
    <CardList :empty="readings.length === 0" empty-key="water.historyEmpty">
      <li v-for="reading in readings" :key="reading.id">
        <Card>
          <FieldGrid :cols="1">
            <div class="flex items-center justify-between gap-s-2">
              <div class="min-w-[0] text-label font-medium text-foreground">
                {{ formatReadingTime(reading.recordedAt, locale) }}
                <span class="text-muted-foreground">{{ tankName(reading.tankId) }}</span>
              </div>
              <StatusBadge :status="reading.status" />
            </div>
            <FieldGrid :cols="2">
              <Metric
                v-for="metric in METRICS"
                :key="metric.name"
                :label="t(metric.labelKey)"
                :value="reading[metric.name]"
                :unit="metric.unit"
              />
            </FieldGrid>
            <p
              v-if="reading.note"
              class="text-caption text-muted-foreground [overflow-wrap:anywhere]"
            >
              {{ reading.note }}
            </p>
            <p v-if="reading.status === 'failed'" class="text-caption font-medium text-sync-failed">
              {{ t(rejectionMessageKey(reading.errorCode)) }}
            </p>
            <Button
              v-if="reading.status === 'failed'"
              type="button"
              variant="secondary"
              size="sm"
              @click="retryFailedReading(reading.id)"
            >
              {{ t('water.fixAndResend') }}
            </Button>
          </FieldGrid>
        </Card>
      </li>
    </CardList>
  </PageBody>
</template>
