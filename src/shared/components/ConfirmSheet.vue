<script setup lang="ts">
import Button from '@/shared/components/ui/Button.vue'
import Sheet from '@/shared/components/ui/Sheet.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'

// A bottom sheet that asks before something that cannot be undone. The safe answer is the first,
// normal-looking button; the dangerous one is red.
defineProps<{
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  busy?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <Sheet v-model:open="open" :title="title" :description="message" content-class="h-auto">
    <template #trigger>
      <span class="hidden" aria-hidden="true" />
    </template>
    <FieldGrid :cols="1">
      <Button :disabled="busy" @click="open = false">{{ cancelLabel }}</Button>
      <Button variant="red-outline" :disabled="busy" @click="emit('confirm')">
        {{ confirmLabel }}
      </Button>
    </FieldGrid>
  </Sheet>
</template>