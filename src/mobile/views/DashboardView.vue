<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { liveQuery, type Subscription } from 'dexie'
import { useI18n } from 'vue-i18n'

import Card from '@/shared/components/Card.vue'
import LineChart from '@/shared/components/LineChart.vue'
import Metric from '@/shared/components/Metric.vue'
import Field from '@/shared/components/ui/Field.vue'
import Select from '@/shared/components/ui/Select.vue'
import CardList from '@/shared/components/layout/CardList.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import StateMessage from '@/shared/components/layout/StateMessage.vue'
import { requireUserId } from '@/shared/composables/useCurrentUserId'
import { formatReadingTime } from '@/shared/lib/datetime'
import { buildTankChartData, type Metric as MetricName, type TankChartData } from '@/shared/lib/chart/chartData'
import { listOwnReadingsForChart } from '@/shared/storage/readings'
import { useErrorStore } from '@/shared/stores/errorStore'
import { useTankStore } from '@/shared/stores/tankStore'

const { t, locale } = useI18n()
const { report } = useErrorStore()
const tankStore = useTankStore()
const userId = requireUserId()

// The user's own readings, from the local data (the last 30 days are kept on the phone).
const METRIC_INFO: { name: MetricName; labelKey: string; unit: string; digits: number }[] = [
  { name: 'ph', labelKey: 'water.ph', unit: '', digits: 2 },
  { name: 'temperatureC', labelKey: 'water.temperature', unit: '°C', digits: 1 },
  { name: 'salinityPpt', labelKey: 'water.salinity', unit: 'ppt', digits: 1 },
  { name: 'oxygenMgL', labelKey: 'water.oxygen', unit: 'mg/L', digits: 2 },
]

const tankId = ref('')
const days = ref('7')
const data = ref<TankChartData | null>(null)

// Inactive tanks stay in the list: their history is still worth a look.
const tankOptions = computed(() =>
  tankStore.tanks.map(tank => ({ label: tank.name, value: tank.id }))
)
const rangeOptions = computed(() => [
  { label: t('dashboard.days7'), value: '7' },
  { label: t('dashboard.days30'), value: '30' },
])

const emptyKey = computed(() => {
  if (tankStore.emptyReason === 'noOrganization') return 'water.noOrganization'
  if (tankStore.loaded && tankStore.tanks.length === 0) return 'water.noTank'
  return undefined
})

// The tank list can arrive after the page opens: pick the first active tank (or the first tank).
watch(
  () => tankStore.tanks,
  tanks => {
    if (tanks.some(tank => tank.id === tankId.value)) return
    tankId.value = (tankStore.activeTanks[0] ?? tanks[0])?.id ?? ''
  },
  { immediate: true }
)

const hasData = computed(() => (data.value?.series[0]?.points.length ?? 0) > 0)

const latestTime = computed(() => {
  const times = Object.values(data.value?.latest ?? {}).map(point => point.time.getTime())
  return times.length > 0 ? formatReadingTime(new Date(Math.max(...times)).toISOString(), locale.value) : ''
})

function latestValue(name: MetricName): string {
  const point = data.value?.latest[name]
  return point ? String(point.value) : '—'
}

// liveQuery runs again when the readings change, so a new save or sync shows up at once. The range
// is worked out inside it, so it slides with the clock.
let subscription: Subscription | undefined

function start(): void {
  subscription?.unsubscribe()
  data.value = null
  if (!tankId.value) return
  const id = tankId.value
  const span = Number(days.value) * 86_400_000
  subscription = liveQuery(async () => {
    // A little past now: a reading may be recorded a few minutes ahead of the phone clock.
    const to = new Date(Date.now() + 10 * 60_000)
    const from = new Date(to.getTime() - span)
    return buildTankChartData(await listOwnReadingsForChart(userId, id, from, to), id, from, to)
  }).subscribe({
    next: value => {
      data.value = value
    },
    error: err => {
      report(err, 'DashboardView:liveQuery')
    },
  })
}

watch([tankId, days], start, { immediate: true })
onBeforeUnmount(() => subscription?.unsubscribe())
</script>

<template>
  <StateMessage v-if="emptyKey">{{ t(emptyKey) }}</StateMessage>
  <PageBody v-else>
    <FieldGrid :cols="2">
      <Field :label="t('dashboard.tank')">
        <template #default="{ id, errorId, hasError }">
          <Select
            :id="id"
            v-model="tankId"
            :options="tankOptions"
            :invalid="hasError"
            :error-id="errorId"
          />
        </template>
      </Field>
      <Field :label="t('dashboard.range')">
        <template #default="{ id, errorId, hasError }">
          <Select
            :id="id"
            v-model="days"
            :options="rangeOptions"
            :invalid="hasError"
            :error-id="errorId"
          />
        </template>
      </Field>
    </FieldGrid>
    <p v-if="data && !hasData" class="text-center text-caption text-muted-foreground">
      {{ t('dashboard.noReadings') }}
    </p>
    <CardList v-else-if="data" :empty="false">
      <li>
        <Card>
          <FieldGrid :cols="2">
            <Metric
              v-for="info in METRIC_INFO"
              :key="info.name"
              :label="t(info.labelKey)"
              :value="latestValue(info.name)"
              :unit="info.unit"
            />
          </FieldGrid>
          <p class="text-caption text-muted-foreground">
            {{ t('dashboard.latest') }} {{ latestTime }}
          </p>
        </Card>
      </li>
      <li v-for="info in METRIC_INFO" :key="`chart-${info.name}`">
        <Card>
          <LineChart
            :points="data.series.find(item => item.metric === info.name)?.points ?? []"
            :from="data.from"
            :to="data.to"
            :label="t(info.labelKey)"
            :unit="info.unit"
            :digits="info.digits"
          />
        </Card>
      </li>
    </CardList>
  </PageBody>
</template>