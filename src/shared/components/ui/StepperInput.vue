<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { cn } from '@/shared/lib/utils'
import Field from '@/shared/components/ui/Field.vue'

const { t } = useI18n()
const model = defineModel<string | number>({ default: '' })
const emit = defineEmits<{
  confirmed: []
}>()

const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    hint?: string
    errorKey?: string
    errorParams?: Record<string, string | number>
    unconfirmed?: boolean
    required?: boolean
    unit?: string
    min?: number
    max?: number
    step?: number
    decimals?: number
    disabled?: boolean
    class?: string
    inputClass?: string
  }>(),
  {
    label: undefined,
    hint: undefined,
    errorKey: undefined,
    errorParams: undefined,
    unconfirmed: false,
    required: false,
    unit: undefined,
    min: Number.NEGATIVE_INFINITY,
    max: Number.POSITIVE_INFINITY,
    step: 1,
    decimals: 0,
    disabled: false,
  }
)

const timeoutHandle = ref<number | undefined>()
const intervalHandle = ref<number | undefined>()

const formatDisplay = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const numeric = Number(value)
  return Number.isFinite(numeric)
    ? Number(numeric.toFixed(props.decimals)).toString()
    : String(value)
}

const inputValue = computed({
  get: () => (typeof model.value === 'string' ? model.value : formatDisplay(model.value)),
  set: value => {
    model.value = value.replace(',', '.')
  },
})

const clampValue = (next: number) => {
  const min = Number.isFinite(props.min) ? props.min : Number.NEGATIVE_INFINITY
  const max = Number.isFinite(props.max) ? props.max : Number.POSITIVE_INFINITY

  return Math.min(max, Math.max(min, next))
}

const updateValue = (direction: number) => {
  const rawValue = String(model.value ?? '')
    .trim()
    .replace(',', '.')
  const raw = rawValue === '' ? Number.NaN : Number(rawValue)
  const hasFiniteRange = Number.isFinite(props.min) && Number.isFinite(props.max)
  const initialValue = hasFiniteRange ? (props.min + props.max) / 2 : 0
  const base = Number.isFinite(raw) ? raw : initialValue
  const next = clampValue(base + direction * props.step)

  model.value = Number(next.toFixed(props.decimals))
  emit('confirmed')
}

const beginRepeat = (direction: number) => {
  if (props.disabled) {
    return
  }

  stopRepeat()
  updateValue(direction)

  timeoutHandle.value = window.setTimeout(() => {
    intervalHandle.value = window.setInterval(() => {
      updateValue(direction)
    }, 120)
  }, 450)
}

const stopRepeat = () => {
  if (timeoutHandle.value !== undefined) {
    window.clearTimeout(timeoutHandle.value)
    timeoutHandle.value = undefined
  }

  if (intervalHandle.value !== undefined) {
    window.clearInterval(intervalHandle.value)
    intervalHandle.value = undefined
  }
}

const handleKeyboardClick = (direction: number, event: MouseEvent) => {
  if (event.detail === 0) {
    updateValue(direction)
  }
}

const wrapperClasses = computed(() =>
  cn(
    'field-control flex h-control min-w-[0] items-center overflow-hidden rounded-control border bg-card',
    'border-border',
    props.disabled && 'cursor-not-allowed opacity-60'
  )
)
const inputClasses = computed(() =>
  cn(
    'h-full w-full min-w-[0] border-0 bg-transparent text-center text-body text-foreground outline-none placeholder:text-muted-foreground',
    props.unconfirmed && 'italic text-muted-foreground',
    props.inputClass
  )
)
const stepClasses =
  'flex h-full w-[var(--control-h)] shrink-0 items-center justify-center border-0 bg-muted text-foreground active:bg-border'

onBeforeUnmount(stopRepeat)
</script>

<template>
  <Field
    :label="label"
    :id="id"
    :hint="hint"
    :error-key="errorKey"
    :error-params="errorParams"
    :required="required"
    :class="props.class"
  >
    <template v-if="$slots.chip" #chip>
      <slot name="chip" />
    </template>
    <template #default="{ id: fieldId, errorId, hasError }">
      <div :class="wrapperClasses">
        <button
          type="button"
          :class="[stepClasses, 'border-r border-border']"
          :disabled="disabled"
          :aria-label="t('common.decreaseValue')"
          @pointerdown="beginRepeat(-1)"
          @pointerup="stopRepeat"
          @pointerleave="stopRepeat"
          @pointercancel="stopRepeat"
          @click="handleKeyboardClick(-1, $event)"
          @contextmenu.prevent
        >
          <svg
            viewBox="0 0 24 24"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
          </svg>
        </button>

        <input
          :id="fieldId"
          v-model="inputValue"
          type="text"
          inputmode="decimal"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          role="spinbutton"
          :aria-valuemin="Number.isFinite(min) ? min : undefined"
          :aria-valuemax="Number.isFinite(max) ? max : undefined"
          :aria-valuenow="
            inputValue !== '' && Number.isFinite(Number(inputValue))
              ? Number(inputValue)
              : undefined
          "
          :aria-invalid="hasError ? 'true' : undefined"
          :aria-describedby="hasError ? errorId : undefined"
          :class="inputClasses"
          @input="emit('confirmed')"
        />
        <span v-if="unit" class="mr-s-2 shrink-0 text-label text-muted-foreground">{{ unit }}</span>

        <button
          type="button"
          :class="[stepClasses, 'border-l border-border']"
          :disabled="disabled"
          :aria-label="t('common.increaseValue')"
          @pointerdown="beginRepeat(1)"
          @pointerup="stopRepeat"
          @pointerleave="stopRepeat"
          @pointercancel="stopRepeat"
          @click="handleKeyboardClick(1, $event)"
          @contextmenu.prevent
        >
          <svg
            viewBox="0 0 24 24"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </template>
  </Field>
</template>

<style scoped>
.field-control:focus-within {
  border-color: var(--color-focus);
  outline: 2px solid var(--color-focus);
  outline-offset: 0;
}
</style>
