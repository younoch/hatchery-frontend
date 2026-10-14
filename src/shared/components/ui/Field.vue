<script setup lang="ts">
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import { cn } from '@/shared/lib/utils'

const { t } = useI18n()
const props = withDefaults(
  defineProps<{
    id?: string
    label?: string
    hint?: string
    errorKey?: string
    errorParams?: Record<string, string | number>
    required?: boolean
    class?: string
    labelClass?: string
    contentClass?: string
  }>(),
  {
    id: undefined,
    label: undefined,
    hint: undefined,
    errorKey: undefined,
    errorParams: undefined,
    required: false,
  }
)

const generatedId = useId()
const id = computed(() => props.id ?? generatedId)
const errorId = computed(() => `${id.value}-error`)
const errorText = computed(() => (props.errorKey ? t(props.errorKey, props.errorParams ?? {}) : ''))
const hasError = computed(() => Boolean(errorText.value))
</script>

<template>
  <div :class="cn('flex min-w-[0px] flex-col gap-s-1', props.class)">
    <div v-if="label || hint" class="flex items-center justify-between gap-s-2">
      <label
        v-if="label"
        :for="id"
        :class="cn('text-label font-medium text-foreground', props.labelClass)"
      >
        {{ label }}
        <span v-if="required" aria-hidden="true" class="required-indicator ml-s-1"></span>
      </label>
      <slot v-if="$slots.chip" name="chip" />
      <span v-else-if="hint" class="text-caption text-muted-foreground">{{ hint }}</span>
    </div>

    <div :class="cn('min-w-[0px]', props.contentClass)">
      <slot :id="id" :error-id="errorId" :has-error="hasError" />
    </div>

    <p
      v-if="hasError"
      :id="errorId"
      role="alert"
      class="flex items-start gap-s-1 text-caption font-medium text-danger"
    >
      <svg
        viewBox="0 0 24 24"
        class="mt-[0.125rem] h-[0.875rem] w-[0.875rem] shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <circle cx="12" cy="12" r="9" />
      </svg>
      <span>{{ errorText }}</span>
    </p>
  </div>
</template>

<style scoped>
.required-indicator::before {
  content: '*';
  color: var(--color-danger);
}
</style>
