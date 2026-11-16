<script setup lang="ts">
import { computed, useId } from 'vue'
import { SwitchRoot, SwitchThumb } from 'reka-ui'

import { cn } from '@/shared/lib/utils'

// A row with the label on the left and a toggle on the right.
const model = defineModel<boolean>({ default: false })

const props = withDefaults(
  defineProps<{
    id?: string
    label: string
    disabled?: boolean
    class?: string
  }>(),
  { id: undefined, disabled: false, class: undefined }
)

const generatedId = useId()
const switchId = computed(() => props.id ?? generatedId)
</script>

<template>
  <label
    :for="switchId"
    :class="
      cn(
        'flex min-h-control items-center justify-between gap-s-3',
        props.disabled ? 'opacity-60' : '',
        props.class
      )
    "
  >
    <span class="min-w-[0] text-body text-foreground [overflow-wrap:anywhere]">{{ label }}</span>
    <SwitchRoot
      :id="switchId"
      v-model="model"
      :disabled="disabled"
      class="relative h-[1.5rem] w-[2.75rem] shrink-0 rounded-full border border-border bg-muted transition-colors disabled:cursor-not-allowed data-[state=checked]:border-primary data-[state=checked]:bg-primary"
    >
      <SwitchThumb
        class="block h-[1.125rem] w-[1.125rem] translate-x-[0.125rem] rounded-full bg-card transition-transform data-[state=checked]:translate-x-[1.375rem]"
      />
    </SwitchRoot>
  </label>
</template>