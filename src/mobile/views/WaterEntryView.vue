<script setup lang="ts">
import { onBeforeUnmount, ref, type Ref } from 'vue'
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
import { createReading } from '@/shared/storage/readings'

const { t } = useI18n()

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

const { errors, defineField, handleSubmit, resetForm, validateField } = useForm({
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
  <form class="flex min-h-full flex-col justify-between" novalidate @submit.prevent="onSubmit">
    <PageBody>
      <FieldGrid :cols="1">
        <Field
          :label="t('water.recordedAt')"
          :error-key="errors.recordedAt"
          :error-params="errorParams(errors.recordedAt)"
          required
        >
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="recordedAt"
              type="datetime-local"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>

        <Field
          :label="t('water.tank')"
          :error-key="errors.tankId"
          :error-params="errorParams(errors.tankId)"
          required
        >
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

        <StepperInput
          v-for="field in FIELDS"
          :key="field.name"
          v-model="models[field.name].value"
          :label="t(field.labelKey)"
          :unit="field.unit"
          :min="WATER_RANGES[field.name].min"
          :max="WATER_RANGES[field.name].max"
          :step="field.step"
          :decimals="field.decimals"
          :error-key="errors[field.name]"
          :error-params="errorParams(errors[field.name])"
          required
          @focusout="validateField(field.name)"
        />

        <FormSection :title="t('water.moreDetails')" collapsible :default-open="false">
          <Field
            :label="`${t('water.note')} ${t('water.optional')}`"
            :error-key="errors.note"
            :error-params="errorParams(errors.note)"
          >
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
