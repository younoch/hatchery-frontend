<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import Button from '@/shared/components/ui/Button.vue'
import Field from '@/shared/components/ui/Field.vue'
import Input from '@/shared/components/ui/Input.vue'
import Select from '@/shared/components/ui/Select.vue'
import StepperInput from '@/shared/components/ui/StepperInput.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import FormSection from '@/shared/components/layout/FormSection.vue'
import NoticeBanner from '@/shared/components/layout/NoticeBanner.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import StateMessage from '@/shared/components/layout/StateMessage.vue'
import StickyActionBar from '@/shared/components/layout/StickyActionBar.vue'
import { CLOCK_SKEW_WARN_MS, clockSkewMs } from '@/shared/lib/clockSkew'
import { localInputToIso, toLocalInputValue } from '@/shared/lib/datetime'
import { isFixable, rejectionMessageKey } from '@/shared/lib/rejection'
import { requestSync } from '@/shared/lib/syncRunner'
import {
  WATER_RANGES,
  waterErrorParams,
  waterReadingFormSchema,
} from '@/shared/schemas/waterQuality.schema'
import type { Reading } from '@/shared/storage/db'
import {
  createReading,
  fixFailedReading,
  getLatestReading,
  getReading,
} from '@/shared/storage/readings'
import { requireUserId } from '@/shared/composables/useCurrentUserId'
import { useTankStore } from '@/shared/stores/tankStore'

// With `editId` the form fixes a failed reading (edit mode) instead of creating one.
const props = defineProps<{ editId?: string }>()

const { t } = useI18n()
const router = useRouter()
const userId = requireUserId()
const tankStore = useTankStore()
const editing = ref<Reading>() // the failed reading being fixed

// Warns only (never blocks) when the phone clock is far from the server's.
const clockOff = computed(
  () => clockSkewMs.value !== null && Math.abs(clockSkewMs.value) > CLOCK_SKEW_WARN_MS,
)
const clockAhead = computed(() => (clockSkewMs.value ?? 0) > 0)
const clockOffMinutes = computed(() => Math.round(Math.abs(clockSkewMs.value ?? 0) / 60_000))

// Step sizes are samples until the owner confirms them.
const FIELDS = [
  { name: 'ph', labelKey: 'water.ph', unit: undefined, step: 0.1, decimals: 1 },
  { name: 'temperatureC', labelKey: 'water.temperature', unit: '°C', step: 0.5, decimals: 1 },
  { name: 'salinityPpt', labelKey: 'water.salinity', unit: 'ppt', step: 1, decimals: 0 },
  { name: 'oxygenMgL', labelKey: 'water.oxygen', unit: 'mg/L', step: 0.1, decimals: 1 },
] as const

// Shown instead of the form when no tank can be offered.
const EMPTY_KEYS = {
  noOrganization: 'water.noOrganization',
  noTank: 'water.noTank',
  failed: 'water.tanksFailed',
} as const
const emptyKey = computed(() =>
  tankStore.emptyReason ? EMPTY_KEYS[tankStore.emptyReason] : undefined,
)

// Inactive tanks are not offered for new readings; the history still shows their names.
const tankOptions = computed(() => {
  const options = tankStore.activeTanks.map(tank => ({ label: tank.name, value: tank.id }))
  // An inactive tank the failed reading already uses stays visible while it is being fixed.
  const current = editing.value?.tankId
  const name = current ? tankStore.nameOf(current) : undefined
  if (current && name && !options.some(option => option.value === current)) {
    options.push({ label: name, value: current })
  }
  return options
})

function emptyValues() {
  return {
    tankId: tankStore.activeTanks[0]?.id ?? '',
    recordedAt: toLocalInputValue(),
    ph: '',
    temperatureC: '',
    salinityPpt: '',
    oxygenMgL: '',
    note: '',
  }
}

const {
  errors,
  defineField,
  handleSubmit,
  resetForm,
  validateField,
  setFieldValue,
  setFieldError,
} = useForm({
  validationSchema: toTypedSchema(waterReadingFormSchema),
  initialValues: emptyValues(),
})

const config = { validateOnModelUpdate: false }
const [tankId] = defineField('tankId', config)
const [recordedAt] = defineField('recordedAt', config)
const [ph] = defineField('ph', config)
const [temperatureC] = defineField('temperatureC', config)
const [salinityPpt] = defineField('salinityPpt', config)
const [oxygenMgL] = defineField('oxygenMgL', config)
const [note] = defineField('note', config)

const models = { ph, temperatureC, salinityPpt, oxygenMgL } as unknown as Record<
  (typeof FIELDS)[number]['name'],
  Ref<string | number | undefined>
>

const errorParams = (key?: string) => (key ? waterErrorParams[key] : undefined)
type FieldName = (typeof FIELDS)[number]['name']
const CONFIRM_KEY = 'water.confirmRequired'

const lastReading = ref<Reading>()
const unconfirmed = reactive<Record<FieldName, boolean>>({
  ph: false,
  temperatureC: false,
  salinityPpt: false,
  oxygenMgL: false,
})
let loadToken = 0

function setUnconfirmed(value: boolean) {
  for (const f of FIELDS) unconfirmed[f.name] = value
}

async function applyLast() {
  if (props.editId) return // edit mode shows the stored values, not the last reading
  const token = ++loadToken
  lastReading.value = undefined
  setUnconfirmed(false)
  for (const f of FIELDS) {
    setFieldValue(f.name, '', false)
    setFieldError(f.name, undefined)
  }
  if (!tankId.value) return

  const last = await getLatestReading(tankId.value, userId)
  if (token !== loadToken || !last) return // stale result or no previous reading

  lastReading.value = last

  for (const f of FIELDS) setFieldValue(f.name, String(last[f.name]), false)
  setUnconfirmed(true)
}

function confirm(name: FieldName) {
  unconfirmed[name] = false
  if (errors.value[name] === CONFIRM_KEY) setFieldError(name, undefined)
}

function fillFromLast(name: FieldName) {
  if (!lastReading.value) return
  setFieldValue(name, String(lastReading.value[name]), false)
  confirm(name)
}

function onFocusOut(name: FieldName) {
  if (!unconfirmed[name]) validateField(name)
}

function onFormSubmit() {
  const pending = FIELDS.filter(f => unconfirmed[f.name])
  if (pending.length) {
    pending.forEach(f => setFieldError(f.name, CONFIRM_KEY))
    return
  }
  return onSubmit()
}

watch(tankId, () => void applyLast())

// The tank list can arrive after the form opens (cache read, then fetch): pick the first tank when
// none is chosen, or when the chosen one is no longer offered.
watch(
  () => tankStore.activeTanks,
  tanks => {
    if (props.editId) return // the user must choose a tank again when `tank_not_found`
    if (tanks.some(tank => tank.id === tankId.value)) return
    setFieldValue('tankId', tanks[0]?.id ?? '', false)
  },
  { immediate: true },
)

const HISTORY_ROUTE = { path: '/m/water', query: { tab: 'history' } }

// Edit mode: only a failed reading with a fixable code can be fixed; otherwise go back.
async function loadForEdit(id: string) {
  const reading = await getReading(id)
  if (!reading || reading.status !== 'failed' || !isFixable(reading.errorCode)) {
    await router.replace(HISTORY_ROUTE)
    return
  }
  editing.value = reading
  resetForm({
    values: {
      // tank_not_found: the stored tank is wrong, so the user chooses one.
      tankId: reading.errorCode === 'tank_not_found' ? '' : reading.tankId,
      recordedAt: toLocalInputValue(new Date(reading.recordedAt)),
      ph: String(reading.ph),
      temperatureC: String(reading.temperatureC),
      salinityPpt: String(reading.salinityPpt),
      oxygenMgL: String(reading.oxygenMgL),
      note: reading.note ?? '',
    },
  })
}

onMounted(() => {
  if (props.editId) void loadForEdit(props.editId)
  else void applyLast()
})
// Opening the form asks for a fresh list, at most once every 10 minutes (the store enforces it).
onMounted(() => void tankStore.refresh())

const isSaving = ref(false)
const statusKey = ref<string>()
let statusTimer: number | undefined

function say(key: string) {
  statusKey.value = key
  window.clearTimeout(statusTimer)
  statusTimer = window.setTimeout(() => {
    statusKey.value = undefined
  }, 5000)
}

const onSubmit = handleSubmit(async values => {
  isSaving.value = true
  try {
    const input = { ...values, recordedAt: localInputToIso(values.recordedAt) }
    if (props.editId) {
      const fixed = await fixFailedReading(props.editId, input)
      if (fixed) void requestSync()
      await router.replace(HISTORY_ROUTE)
      return
    }
    await createReading(input, userId)
    resetForm({ values: emptyValues() })
    void applyLast()
    say('water.saved')
    void requestSync()
  } finally {
    isSaving.value = false
  }
})

function onCancel() {
  if (props.editId) {
    void router.replace(HISTORY_ROUTE)
    return
  }
  resetForm({ values: emptyValues() })
  say('water.cancelled')
}

onBeforeUnmount(() => window.clearTimeout(statusTimer))
</script>

<template>
  <form class="flex flex-1 flex-col justify-between" novalidate @submit.prevent="onFormSubmit">
    <NoticeBanner v-if="clockOff">
      {{ t(clockAhead ? 'water.clockAhead' : 'water.clockBehind', { minutes: clockOffMinutes }) }}
    </NoticeBanner>
    <NoticeBanner v-if="editing">
      {{ t(rejectionMessageKey(editing.errorCode)) }}
    </NoticeBanner>
    <StateMessage v-if="emptyKey">
      {{ t(emptyKey) }}
      <template #action>
        <Button v-if="tankStore.emptyReason === 'failed'" :disabled="tankStore.loading"
          @click="tankStore.refresh(true)">
          {{ t('water.retry') }}
        </Button>
      </template>
    </StateMessage>
    <PageBody v-else>
      <FieldGrid :cols="1">
        <Field :label="t('water.recordedAt')" :error-key="errors.recordedAt"
          :error-params="errorParams(errors.recordedAt)" required>
          <template #default="{ id, errorId, hasError }">
            <Input :id="id" v-model="recordedAt" type="datetime-local" :invalid="hasError" :error-id="errorId" />
          </template>
        </Field>

        <Field :label="t('water.tank')" :error-key="errors.tankId" :error-params="errorParams(errors.tankId)" required>
          <template #default="{ id, errorId, hasError }">
            <Select :id="id" v-model="tankId" :options="tankOptions" :invalid="hasError" :error-id="errorId" />
          </template>
        </Field>

        <StepperInput v-for="field in FIELDS" :key="field.name" v-model="models[field.name].value"
          :label="t(field.labelKey)" :unit="field.unit" :min="WATER_RANGES[field.name].min"
          :max="WATER_RANGES[field.name].max" :step="field.step" :decimals="field.decimals"
          :unconfirmed="unconfirmed[field.name]" :error-key="errors[field.name]"
          :error-params="errorParams(errors[field.name])" required @confirmed="confirm(field.name)"
          @focusout="onFocusOut(field.name)">
          <template #chip>
            <Button v-if="lastReading" type="button" variant="secondary" size="sm" @click="fillFromLast(field.name)">
              {{ t('water.sameAsLast', { value: lastReading[field.name] }) }}
            </Button>
          </template>
        </StepperInput>

        <FormSection :title="t('water.moreDetails')" collapsible :default-open="false">
          <Field :label="`${t('water.note')} ${t('water.optional')}`" :error-key="errors.note"
            :error-params="errorParams(errors.note)">
            <template #default="{ id, errorId, hasError }">
              <Input :id="id" v-model="note" :invalid="hasError" :error-id="errorId" />
            </template>
          </Field>
        </FormSection>
      </FieldGrid>
    </PageBody>

    <StickyActionBar v-if="!emptyKey" :status-key="statusKey">
      <Button variant="red-outline" :disabled="isSaving" @click="onCancel">
        {{ t('common.cancel') }}
      </Button>
      <Button type="submit" :disabled="isSaving">
        {{ t(editId ? 'water.fixAndResend' : 'common.save') }}
      </Button>
    </StickyActionBar>
  </form>
</template>
