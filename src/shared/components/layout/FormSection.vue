<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = withDefaults(
  defineProps<{
    title?: string
    collapsible?: boolean
    open?: boolean
    defaultOpen?: boolean
    id?: string
    as?: string
    headingAs?: 'h2' | 'h3' | 'h4'
    class?: string
    contentClass?: string
  }>(),
  {
    title: undefined,
    collapsible: true,
    open: undefined,
    defaultOpen: true,
    id: undefined,
    as: 'section',
    headingAs: 'h3',
    class: undefined,
    contentClass: undefined,
  }
)

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const generatedId = useId()
const contentId = computed(() => props.id ?? `section-${generatedId}`)

const uncontrolledOpen = ref(props.defaultOpen)

const isOpen = computed(() => (props.open !== undefined ? props.open : uncontrolledOpen.value))

function toggle() {
  if (!props.collapsible) return
  const next = !isOpen.value
  uncontrolledOpen.value = next
  emit('update:open', next)
}
</script>

<template>
  <component :is="as" :class="cn('grid gap-s-2', props.class)">
    <component :is="headingAs" v-if="collapsible" class="min-h-(--control-h)">
      <button
        type="button"
        class="flex min-h-(--control-h) w-full min-w-[0] items-center justify-between gap-s-2 border-0 bg-transparent text-left text-label font-semibold text-foreground"
        :aria-expanded="isOpen"
        :aria-controls="contentId"
        @click="toggle"
      >
        <span class="min-w-[0] flex-1">
          <slot name="title">
            <span>{{ title }}</span>
          </slot>
        </span>
        <svg
          viewBox="0 0 24 24"
          class="size-[1.25rem] shrink-0 text-muted-foreground transition-transform duration-150"
          :class="{ 'rotate-90': isOpen }"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </component>
    <component
      :is="headingAs"
      v-else
      class="flex min-h-(--control-h) items-center text-label font-semibold text-foreground"
    >
      <slot name="title">
        <span>{{ title }}</span>
      </slot>
    </component>
    <div
      :id="contentId"
      :hidden="collapsible && !isOpen"
      :class="cn('min-w-[0]', props.contentClass)"
    >
      <slot />
    </div>
  </component>
</template>
