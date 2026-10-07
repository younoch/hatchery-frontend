<script setup lang="ts">
import { computed } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

import { cn } from '@/shared/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    items?: Array<{ label: string; value: string }>
    class?: string
    listClass?: string
    triggerClass?: string
    contentClass?: string
  }>(),
  {
    modelValue: '',
    items: () => [],
    class: undefined,
    listClass: undefined,
    triggerClass: undefined,
    contentClass: undefined,
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const value = computed<string>({
  get: () => props.modelValue ?? '',
  set: next => emit('update:modelValue', next),
})

const listClasses =
  'grid w-full grid-cols-[repeat(var(--tab-count),minmax(0,1fr))] gap-s-1 rounded-control bg-muted p-s-1'
const triggerClasses =
  'tabs-trigger relative flex h-[var(--small-h)] items-center justify-center rounded-control px-s-3 text-label font-medium text-muted-foreground transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground'
</script>

<template>
  <TabsRoot v-model="value" :class="cn('flex w-full flex-col gap-s-3', props.class)">
    <TabsList
      :class="cn(listClasses, props.listClass)"
      :style="{ '--tab-count': String(Math.max(items.length, 1)) }"
    >
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :class="cn(triggerClasses, props.triggerClass)"
      >
        {{ item.label }}
      </TabsTrigger>
    </TabsList>

    <slot />

    <template v-if="items.length">
      <TabsContent
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :class="cn('outline-none', props.contentClass)"
      >
        <slot :name="`content-${item.value}`" :item="item" />
      </TabsContent>
    </template>
  </TabsRoot>
</template>

<style scoped>
.tabs-trigger {
  position: relative;
}

.tabs-trigger::after {
  content: '';
  position: absolute;
  inset: -6px 0;
  pointer-events: auto;
}
</style>
