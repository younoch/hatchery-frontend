<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ToastClose, ToastProvider, ToastRoot, ToastViewport } from 'reka-ui'

import { cn } from '@/shared/lib/utils'
import { TOAST_DURATION_MS, useToast, type ToastVariant } from '@/shared/composables/useToast'


const { t } = useI18n()
const { current, dismiss } = useToast()

// Full class strings, so Tailwind can see them. Icon and text always go together.
const STYLES: Record<ToastVariant, string> = {
  error: 'text-sync-failed',
  success: 'text-sync-synced',
  info: 'text-foreground',
}
const ICONS: Record<ToastVariant, string> = {
  error: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6',
  success: 'M5 12l5 5 9-10',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v5M12 16.5v.01',
}

const open = computed({
  get: () => current.value !== null,
  set: value => {
    if (!value) dismiss()
  },
})
</script>

<template>
  <ToastProvider :label="t('toast.label')">
    <ToastRoot
      v-if="current"
      :key="current.id"
      v-model:open="open"
      :duration="TOAST_DURATION_MS[current.variant]"
      :type="current.variant === 'error' ? 'foreground' : 'background'"
      class="flex items-start gap-s-2 rounded-control border border-border bg-background p-s-3 text-caption"
    >
      <svg
        :class="cn('h-[1rem] w-[1rem] shrink-0', STYLES[current.variant])"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path :d="ICONS[current.variant]" />
      </svg>
      <span class="min-w-[0] flex-1">{{ t(current.messageKey, current.params ?? {}) }}</span>
      <ToastClose class="shrink-0" :aria-label="t('common.close')">
        <svg
          class="h-[1rem] w-[1rem]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </ToastClose>
    </ToastRoot>
    <ToastViewport
      class="fixed right-[0] top-[0] z-50 w-full max-w-[24rem] p-s-4"
    />
  </ToastProvider>
</template>