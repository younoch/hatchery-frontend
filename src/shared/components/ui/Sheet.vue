<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from 'reka-ui'

import { cn } from '@/shared/lib/utils'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    open?: boolean
    title?: string
    description?: string
    class?: string
    contentClass?: string
    bottomOffset?: number | string
  }>(),
  {
    open: false,
    title: undefined,
    description: undefined,
    class: undefined,
    contentClass: undefined,
    bottomOffset: 0,
  }
)

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const open = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const sheetStyle = computed(() => ({
  '--sheet-offset-bottom': `${String(props.bottomOffset).replace(/px$/, '')}px`,
}))
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-foreground/50" />

      <DialogContent
        :style="sheetStyle"
        @keydown.esc.prevent="open = false"
        :class="
          cn(
            'fixed inset-x-0 bottom-[var(--sheet-offset-bottom)] z-50 mx-auto h-[68%] w-full max-w-[420px] rounded-t-sheet border border-border bg-card px-s-4 pb-s-4 pt-s-3',
            props.contentClass
          )
        "
      >
        <div class="mx-auto flex w-full max-w-[420px] flex-col gap-s-3">
          <div class="mx-auto h-1.5 w-12 rounded-full bg-muted" aria-hidden="true" />

          <div class="flex items-start justify-between gap-s-3">
            <div v-if="title || description" class="flex min-w-0 flex-1 flex-col gap-s-1">
              <DialogTitle v-if="title" class="text-h2 font-semibold text-foreground">
                {{ title }}
              </DialogTitle>
              <DialogDescription v-if="description" class="text-caption text-muted-foreground">
                {{ description }}
              </DialogDescription>
            </div>
            <div v-else class="flex-1" />

            <DialogClose as-child>
              <button
                type="button"
                class="flex h-control w-control items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-muted active:bg-border focus-visible:outline-none"
                :aria-label="t('common.close')"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </DialogClose>
          </div>

          <div :class="cn('flex flex-col gap-s-3', props.class)">
            <slot />
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
