<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { cn } from '@/shared/lib/utils'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    as?: 'ul' | 'ol' | 'div'
    empty?: boolean
    emptyKey?: string
    class?: string
  }>(),
  {
    as: 'ul',
    empty: false,
    emptyKey: undefined,
    class: undefined,
  }
)

const resolvedEmpty = computed(() => {
  if (props.emptyKey) return t(props.emptyKey)
  return ''
})

const itemTag = computed(() => (props.as === 'div' ? 'div' : 'li'))
</script>

<template>
  <component :is="as" role="list" :class="cn('grid list-none gap-s-2', props.class)">
    <component :is="itemTag" v-if="empty" class="text-center text-caption text-muted-foreground">
      <slot name="empty">
        <span>{{ resolvedEmpty }}</span>
      </slot>
    </component>
    <slot v-else />
  </component>
</template>
