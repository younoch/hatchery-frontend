<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { cn } from '@/shared/lib/utils'
import type { SyncStatus } from '@/shared/storage/db'

const { t } = useI18n()

const props = defineProps<{
  status: SyncStatus
  class?: string
}>()

// Full class strings, so Tailwind can see them. Color, icon and text always go together.
const STYLES: Record<SyncStatus, string> = {
  pending: 'bg-warning-soft text-sync-pending',
  syncing: 'bg-warning-soft text-sync-syncing',
  failed: 'bg-danger-soft text-sync-failed',
  synced: 'bg-success-soft text-sync-synced',
}

const ICONS: Record<SyncStatus, string> = {
  pending: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  syncing: 'M20 12a8 8 0 0 0-14-5M4 12a8 8 0 0 0 14 5M6 3v4h4M18 21v-4h-4',
  failed: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6',
  synced: 'M5 12l5 5 9-10',
}

const label = computed(() => t(`sync.${props.status}`))
</script>

<template>
  <span
    :class="
      cn(
        'inline-flex items-center gap-s-1 whitespace-nowrap rounded-full px-s-2 text-caption font-semibold',
        STYLES[status],
        props.class
      )
    "
  >
    <svg
      class="h-[0.8125rem] w-[0.8125rem] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path :d="ICONS[status]" />
    </svg>
    <span>{{ label }}</span>
  </span>
</template>
