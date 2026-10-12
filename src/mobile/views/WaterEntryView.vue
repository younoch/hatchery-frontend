<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import Button from '@/shared/components/ui/Button.vue'
import Field from '@/shared/components/ui/Field.vue'
import Input from '@/shared/components/ui/Input.vue'
import Select from '@/shared/components/ui/Select.vue'
import StepperInput from '@/shared/components/ui/StepperInput.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import FormSection from '@/shared/components/layout/FormSection.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import StickyActionBar from '@/shared/components/layout/StickyActionBar.vue'
import { TANKS } from '@/shared/config/tanks'
import { localInputToIso, toLocalInputValue } from '@/shared/lib/datetime'
import {
  WATER_RANGES,
  waterErrorParams,
  waterReadingFormSchema,
} from '@/shared/schemas/waterQuality.schema'
import type { Reading } from '@/shared/storage/db'
import { createReading, getLatestReading, isLastValueFresh } from '@/shared/storage/readings'

const { t, locale } = useI18n()

// Step sizes are samples until the owner confirms them.
const FIELDS = [
  { name: 'ph', labelKey: 'water.ph', unit: undefined, step: 0.1, decimals: 1 },
  { name: 'temperatureC', labelKey: 'water.temperature', unit: '°C', step: 0.5, decimals: 1 },
  { name: 'salinityPpt', labelKey: 'water.salinity', unit: 'ppt', step: 1, decimals: 0 },
  { name: 'oxygenMgL', labelKey: 'water.oxygen', unit: 'mg/L', step: 0.1, decimals: 1 },
] as const

const tankOptions = TANKS.map(tank => ({ label: tank.name, value: tank.id }))

function emptyValues() {
  return {
    tankId: TANKS[0].id as string,
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
const lastFresh = ref(false)
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

function formatWhen(iso: string) {
  // latn numbering keeps English digits in Bangla text
  return new Intl.DateTimeFormat(locale.value === 'bn' ? 'bn-BD-u-nu-latn' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

async function applyLast() {
  const token = ++loadToken
  lastReading.value = undefined
  lastFresh.value = false
  setUnconfirmed(false)
  for (const f of FIELDS) {
    setFieldValue(f.name, '', false)
    setFieldError(f.name, undefined)
  }
  if (!tankId.value) return

  const last = await getLatestReading(tankId.value)
  if (token !== loadToken || !last) return // stale result or no previous reading

  lastReading.value = last
  lastFresh.value = isLastValueFresh(last)
  if (!lastFresh.value) return // older than the limit: hint only

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
onMounted(() => void applyLast())

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
    await createReading({
      ...values,
      recordedAt: localInputToIso(values.recordedAt),
    })
    resetForm({ values: emptyValues() })
    void applyLast()
    say('water.saved')
  } finally {
    isSaving.value = false
  }
})

function onCancel() {
  resetForm({ values: emptyValues() })
  say('water.cancelled')
}

onBeforeUnmount(() => window.clearTimeout(statusTimer))
</script>

<template>
  <form class="flex flex-1 flex-col justify-between" novalidate @submit.prevent="onFormSubmit">
    <PageBody>
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
            <Button v-if="lastReading && lastFresh" type="button" variant="secondary" size="sm"
              @click="fillFromLast(field.name)">
              {{ t('water.sameAsLast', { value: lastReading[field.name] }) }}
            </Button>
            <span v-else-if="lastReading" class="text-caption text-muted-foreground">
              {{
              t('water.lastOld', {
              value: lastReading[field.name],
              when: formatWhen(lastReading.recordedAt),
              })
              }}
            </span>
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

    <StickyActionBar :status-key="statusKey">
      <Button variant="red-outline" :disabled="isSaving" @click="onCancel">
        {{ t('common.cancel') }}
      </Button>
      <Button type="submit" :disabled="isSaving">{{ t('common.save') }}</Button>
    </StickyActionBar>
  </form>
</template>
