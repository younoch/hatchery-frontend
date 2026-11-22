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
import { fetchOrganizationLatest } from '@/shared/api/readingsApi'
import { ApiError } from '@/shared/api/apiError'
import { errorMessageKey } from '@/shared/api/errorKey'
import Button from '@/shared/components/ui/Button.vue'
import { requireUserId } from '@/shared/composables/useCurrentUserId'
import { authorName, loadOrganizationReadings } from '@/shared/lib/chart/orgChartData'
import { formatReadingTime } from '@/shared/lib/datetime'
import type { OrgReading } from '@/shared/schemas/readingList.schema'
import { useAuthStore } from '@/shared/stores/authStore'
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

const auth = useAuthStore()

// A user with `reading:read-all` sees the organization's readings from the server (online only);
// everybody else sees his own readings from the local data.
const orgMode = computed(() => auth.hasPermission('reading:read-all'))

const tankId = ref('')
const days = ref('7')
const data = ref<TankChartData | null>(null)

// Organization view: what the server sent, the person filter, and the loading state.
const orgReadings = ref<OrgReading[]>([])
const orgLatest = ref<OrgReading[]>([])
const authorId = ref('all')
const loading = ref(false)
const errorKey = ref<string | null>(null)

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

// The people who recorded readings in the period, for the filter.
const authorOptions = computed(() => {
  const seen = new Map<string, string>()
  for (const reading of orgReadings.value) seen.set(reading.createdBy.id, authorName(reading))
  return [
    { label: t('dashboard.everyone'), value: 'all' },
    ...[...seen].map(([value, label]) => ({ label, value })),
  ]
})

// The organization view takes the summary from `/latest` (the tank's newest reading, even when it
// is older than the period); the own view from the charted readings.
const orgLatestReading = computed(() => orgLatest.value.find(item => item.tankId === tankId.value))

const latestTime = computed(() => {
  if (orgMode.value) {
    const reading = orgLatestReading.value
    return reading ? formatReadingTime(reading.recordedAt, locale.value) : ''
  }
  const times = Object.values(data.value?.latest ?? {}).map(point => point.time.getTime())
  return times.length > 0 ? formatReadingTime(new Date(Math.max(...times)).toISOString(), locale.value) : ''
})

function latestValue(name: MetricName): string {
  if (orgMode.value) {
    const reading = orgLatestReading.value
    return reading ? String(reading[name]) : '—'
  }
  const point = data.value?.latest[name]
  return point ? String(point.value) : '—'
}

// Builds the chart data from the organization's readings, filtered by person.
function buildOrgData(from: Date, to: Date): void {
  const readings =
    authorId.value === 'all'
      ? orgReadings.value
      : orgReadings.value.filter(reading => reading.createdBy.id === authorId.value)
  data.value = buildTankChartData(
    readings.map(reading => ({ ...reading, author: authorName(reading) })),
    tankId.value,
    from,
    to
  )
}

async function loadOrganization(): Promise<void> {
  if (!tankId.value) return
  if (!navigator.onLine) {
    errorKey.value = 'manage.needsInternet'
    return
  }
  loading.value = true
  errorKey.value = null
  const to = new Date(Date.now() + 10 * 60_000)
  const from = new Date(to.getTime() - Number(days.value) * 86_400_000)
  try {
    const [readings, latest] = await Promise.all([
      loadOrganizationReadings(tankId.value, from, to),
      fetchOrganizationLatest(),
    ])
    orgReadings.value = readings
    orgLatest.value = latest.items
    authorId.value = 'all'
    buildOrgData(from, to)
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') await auth.clearSession()
    errorKey.value = error.kind === 'network' ? 'manage.needsInternet' : errorMessageKey(error)
  } finally {
    loading.value = false
  }
}

// liveQuery runs again when the readings change, so a new save or sync shows up at once. The range
// is worked out inside it, so it slides with the clock.
let subscription: Subscription | undefined

function start(): void {
  subscription?.unsubscribe()
  data.value = null
  if (!tankId.value) return
  if (orgMode.value) {
    void loadOrganization()
    return
  }
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

// Another person in the organization view: the same readings, filtered again.
watch(authorId, () => {
  if (!orgMode.value) return
  const to = new Date(Date.now() + 10 * 60_000)
  buildOrgData(new Date(to.getTime() - Number(days.value) * 86_400_000), to)
})
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
      <Field v-if="orgMode" :label="t('dashboard.author')">
        <template #default="{ id, errorId, hasError }">
          <Select
            :id="id"
            v-model="authorId"
            :options="authorOptions"
            :invalid="hasError"
            :error-id="errorId"
          />
        </template>
      </Field>
    </FieldGrid>
    <p v-if="loading" class="text-center text-caption text-muted-foreground">
      {{ t('manage.loading') }}
    </p>
    <StateMessage v-else-if="errorKey">
      {{ t(errorKey) }}
      <template #action>
        <Button @click="loadOrganization">{{ t('manage.retry') }}</Button>
      </template>
    </StateMessage>
    <p v-else-if="data && !hasData" class="text-center text-caption text-muted-foreground">
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