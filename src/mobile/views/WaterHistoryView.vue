<script setup lang="ts">
import { liveQuery } from 'dexie'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { ApiError } from '@/shared/api/apiError'
import { errorMessageKey } from '@/shared/api/errorKey'
import { deleteReading } from '@/shared/api/readingsApi'
import Card from '@/shared/components/Card.vue'
import ConfirmSheet from '@/shared/components/ConfirmSheet.vue'
import Metric from '@/shared/components/Metric.vue'
import StatusBadge from '@/shared/components/StatusBadge.vue'
import Button from '@/shared/components/ui/Button.vue'
import CardList from '@/shared/components/layout/CardList.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import {
  correctionTimeLeft,
  isCorrectable,
  isCorrected,
  WINDOW_CLOSED_AT,
} from '@/shared/lib/correction'
import { formatReadingTime } from '@/shared/lib/datetime'
import { isFixable, rejectionMessageKey } from '@/shared/lib/rejection'
import {
  deleteFailedReading,
  listReadings,
  removeLocalReadings,
  setEditableUntil,
} from '@/shared/storage/readings'
import type { Reading } from '@/shared/storage/db'
import { requireUserId } from '@/shared/composables/useCurrentUserId'
import { useToast } from '@/shared/composables/useToast'
import { useAuthStore } from '@/shared/stores/authStore'
import { useErrorStore } from '@/shared/stores/errorStore'
import { useTankStore } from '@/shared/stores/tankStore'

const { t, locale } = useI18n()
const { report } = useErrorStore()
const tankStore = useTankStore()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

// Fix and resend opens the reading form in edit mode.
function fix(id: string) {
  void router.push(`/m/water/edit/${id}`)
}

const METRICS = [
  { name: 'ph', labelKey: 'water.ph', unit: undefined },
  { name: 'temperatureC', labelKey: 'water.temperature', unit: '°C' },
  { name: 'salinityPpt', labelKey: 'water.salinity', unit: 'ppt' },
  { name: 'oxygenMgL', labelKey: 'water.oxygen', unit: 'mg/L' },
] as const

const readings = ref<Reading[]>([])
let unsubscribe: (() => void) | undefined

const tankName = (id: string) => tankStore.nameOf(id) ?? t('water.unknownTank')

// The time left of a window changes while the page stays open: the clock is read again every
// minute. Reading `tick` makes the functions below follow it.
const tick = ref(0)
let tickTimer: number | undefined

function canCorrect(reading: Reading): boolean {
  void tick.value
  return isCorrectable(reading)
}

// One line under the values: "Corrected" and the time left, joined here, not in the template.
function correctionHint(reading: Reading): string | undefined {
  const parts: string[] = []
  if (isCorrected(reading)) parts.push(t('water.corrected'))
  if (canCorrect(reading)) {
    const left = correctionTimeLeft(reading)
    parts.push(t(left.key, { count: left.count }))
  }
  return parts.length > 0 ? parts.join(' · ') : undefined
}

// A failed reading can be deleted after a confirmation; it is not on the server, so nothing is
// lost there.
const deleteId = ref<string | null>(null)
const deleteOpen = ref(false)

function askDelete(id: string) {
  deleteId.value = id
  deleteOpen.value = true
}

const deleting = ref(false)

function closeDelete() {
  deleteOpen.value = false
  deleteId.value = null
}

// The server refused, or the reading is gone: the phone follows what the server said.
async function onDeleteError(error: ApiError, id: string) {
  if (error.kind === 'session_ended') {
    await auth.clearSession()
    return
  }
  if (error.code === 'reading_not_found') await removeLocalReadings([id])
  else if (error.code === 'edit_window_closed') await setEditableUntil(id, WINDOW_CLOSED_AT)
  else if (error.code === 'not_author') await setEditableUntil(id, null)
  toast.error(errorMessageKey(error))
}

// A failed reading is only on the phone. A synced reading is deleted on the server first (online
// only) and on the phone after that succeeded.
async function confirmDelete() {
  const id = deleteId.value
  const reading = readings.value.find(row => row.id === id)
  if (!id || !reading) {
    closeDelete()
    return
  }
  if (reading.status === 'failed') {
    await deleteFailedReading(id)
    closeDelete()
    return
  }
  if (reading.status !== 'synced') {
    closeDelete()
    return
  }
  if (!navigator.onLine) {
    toast.error('water.correctionNeedsInternet')
    closeDelete()
    return
  }
  deleting.value = true
  try {
    await deleteReading(id)
    await removeLocalReadings([id])
    toast.success('water.deleted')
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    await onDeleteError(error, id)
  } finally {
    deleting.value = false
    closeDelete()
  }
}

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
  tickTimer = window.setInterval(() => {
    tick.value += 1
  }, 60_000)
})

onBeforeUnmount(() => {
  unsubscribe?.()
  window.clearInterval(tickTimer)
})
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
            <p v-if="correctionHint(reading)" class="text-caption text-muted-foreground">
              {{ correctionHint(reading) }}
            </p>
            <p v-if="reading.status === 'failed'" class="text-caption font-medium text-sync-failed">
              {{ t(rejectionMessageKey(reading.errorCode)) }}
            </p>
            <Button
              v-if="reading.status === 'failed' && isFixable(reading.errorCode)"
              type="button"
              variant="secondary"
              size="sm"
              @click="fix(reading.id)"
            >
              {{ t('water.fixAndResend') }}
            </Button>
            <Button
              v-if="reading.status === 'failed' || canCorrect(reading)"
              type="button"
              variant="red-outline"
              size="sm"
              @click="askDelete(reading.id)"
            >
              {{ t('water.delete') }}
            </Button>
          </FieldGrid>
        </Card>
      </li>
    </CardList>
    <ConfirmSheet
      v-model:open="deleteOpen"
      :title="t('water.deleteTitle')"
      :message="t('water.deleteMessage')"
      :confirm-label="t('water.deleteConfirm')"
      :cancel-label="t('water.deleteCancel')"
      :busy="deleting"
      @confirm="confirmDelete"
    />
  </PageBody>
</template>
