<script setup lang="ts">
import { cn } from '@/shared/lib/utils'

const props = withDefaults(
  defineProps<{
    title?: string
    titleAs?: 'h1' | 'h2' | 'h3'
    class?: string
    titleClass?: string
  }>(),
  {
    title: undefined,
    titleAs: 'h1',
    class: undefined,
    titleClass: undefined,
  }
)
</script>

<template>
  <header
    :class="
      cn(
        'flex min-h-[3.5rem] items-center justify-between gap-s-2 border-b border-border bg-card py-s-3 pl-s-4 pr-s-3',
        props.class
      )
    "
  >
    <div class="flex min-w-[0] items-center gap-s-2">
      <slot name="leading" />
      <slot name="title">
        <component
          :is="titleAs"
          v-if="title"
          :class="
            cn(
              'min-w-[0] text-h1 font-semibold text-foreground [text-wrap:balance]',
              props.titleClass
            )
          "
        >
          {{ title }}
        </component>
      </slot>
      <slot />
    </div>

    <div v-if="$slots.actions" class="flex shrink-0 items-center gap-s-2">
      <slot name="actions" />
    </div>
  </header>
</template>
