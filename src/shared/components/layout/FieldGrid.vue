<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/shared/lib/utils'

const props = withDefaults(
  defineProps<{
    cols?: 1 | 2
    as?: string
    id?: string
    class?: string
  }>(),
  {
    cols: 2,
    as: 'div',
    id: undefined,
    class: undefined,
  }
)

const gridClass = computed(() => (props.cols === 1 ? 'grid-cols-1' : 'grid-cols-2'))
</script>

<template>
  <component :is="as" :id="id" :class="cn('grid gap-s-3', gridClass, props.class)">
    <slot />
  </component>
</template>
