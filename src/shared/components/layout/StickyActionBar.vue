<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { cn } from '@/shared/lib/utils'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    statusKey?: string
    statusParams?: Record<string, string | number>
    as?: string
    class?: string
    contentClass?: string
  }>(),
  {
    statusKey: undefined,
    statusParams: undefined,
    as: 'footer',
    class: undefined,
    contentClass: undefined,
  }
)

const resolvedStatus = computed(() => {
  if (props.statusKey) return t(props.statusKey, props.statusParams ?? {})
  return ''
})
</script>

<template>
  <component :is="as" :class="cn('sticky bottom-[0] z-10 bg-card px-s-4 py-s-2', props.class)">
    <div aria-hidden="true" class="absolute left-[0] right-[0] top-[0] border-t border-border" />
    <div
      role="status"
      aria-live="polite"
      class="absolute bottom-[calc(100%+var(--s-2))] left-s-4 right-s-4 z-20 rounded-control border border-border bg-card px-s-3 py-s-2 text-caption text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
      :class="{ hidden: !resolvedStatus && !$slots.status }"
    >
      <slot name="status">
        <span>{{ resolvedStatus }}</span>
      </slot>
    </div>

    <div :class="cn('grid grid-cols-2 gap-s-2', props.contentClass)">
      <slot />
    </div>
  </component>
</template>
