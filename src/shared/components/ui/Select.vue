<script setup lang="ts">
import { computed, useId } from 'vue'
import {
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from 'reka-ui'

import { cn } from '@/shared/lib/utils'

defineOptions({ inheritAttrs: false })

const model = defineModel<string | number>({ default: '' })

const props = withDefaults(
  defineProps<{
    id?: string
    options?: Array<{ label: string; value: string | number; disabled?: boolean }>
    placeholder?: string
    invalid?: boolean
    errorId?: string
    disabled?: boolean
    class?: string
  }>(),
  {
    options: () => [],
    placeholder: undefined,
    invalid: false,
    errorId: undefined,
    disabled: false,
  }
)

const generatedId = useId()
const fieldId = computed(() => props.id ?? generatedId)
const selectedLabel = computed(
  () => props.options.find(option => option.value === model.value)?.label ?? props.placeholder ?? ''
)

const triggerClasses = computed(() =>
  cn(
    'select-trigger flex h-control w-full min-w-0 items-center justify-between gap-s-2 rounded-control border bg-card px-s-3 text-left text-body text-foreground disabled:cursor-not-allowed disabled:opacity-60',
    props.invalid ? 'border-danger' : 'border-border',
    props.class
  )
)

const contentClasses =
  'z-50 min-w-[var(--reka-select-trigger-width)] overflow-hidden rounded-control border border-border bg-card p-s-1 text-foreground'
const itemClasses =
  'flex min-h-[var(--control-h)] cursor-default select-none items-center rounded-control px-s-3 text-body outline-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
</script>

<template>
  <SelectRoot v-model="model" :disabled="disabled">
    <SelectTrigger
      v-bind="$attrs"
      :id="fieldId"
      :class="triggerClasses"
      :aria-invalid="invalid || undefined"
      :aria-describedby="errorId"
    >
      <SelectValue :placeholder="placeholder">{{ selectedLabel }}</SelectValue>
      <svg
        viewBox="0 0 24 24"
        class="h-4 w-4 shrink-0 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m7 10 5 5 5-5" />
      </svg>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent :class="contentClasses" position="popper" :side-offset="4">
        <SelectItem
          v-for="option in options"
          :key="String(option.value)"
          :value="option.value"
          :disabled="option.disabled"
          :class="itemClasses"
        >
          <SelectItemText>{{ option.label }}</SelectItemText>
        </SelectItem>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style scoped>
.select-trigger:focus-visible {
  border-color: var(--color-focus);
  outline: 2px solid var(--color-focus);
  outline-offset: 0;
}
</style>
