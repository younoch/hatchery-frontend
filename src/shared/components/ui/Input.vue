<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'

import { computed, useId } from 'vue'

import { cn } from '@/shared/lib/utils'

const model = defineModel<string | number>({ default: '' })

const props = withDefaults(
  defineProps<{
    id?: string
    type?: InputHTMLAttributes['type']
    invalid?: boolean
    unit?: string
    errorId?: string
    inputmode?: InputHTMLAttributes['inputmode']
    class?: string
    inputClass?: string
  }>(),
  {
    type: 'text',
    invalid: false,
    unit: undefined,
    errorId: undefined,
    inputmode: undefined,
  }
)

const generatedId = useId()
const fieldId = computed(() => props.id ?? generatedId)

const inputClasses = computed(() =>
  cn(
    'h-control w-full min-w-[0] bg-transparent px-s-3 text-body text-foreground placeholder:text-muted-foreground',
    props.inputClass
  )
)

const wrapperClasses = computed(() =>
  cn(
    'flex h-control min-w-[0] items-center overflow-hidden rounded-control border bg-card transition-colors',
    props.invalid ? 'border-danger' : 'border-border',
    'field-control',
    props.class
  )
)
</script>

<template>
  <div :class="wrapperClasses">
    <input
      v-bind="$attrs"
      :id="fieldId"
      v-model="model"
      :type="type"
      :inputmode="inputmode"
      :aria-invalid="invalid || undefined"
      :aria-describedby="invalid ? errorId : undefined"
      :class="inputClasses"
    />
    <span v-if="unit" class="mr-s-3 shrink-0 text-label font-medium text-muted-foreground">
      {{ unit }}
    </span>
  </div>
</template>

<style scoped>
.field-control:focus-within {
  border-color: var(--color-focus);
  outline: 2px solid var(--color-focus);
  outline-offset: 0;
}
</style>
