<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import PageHeader from '@/shared/components/layout/PageHeader.vue'
import Button from '@/shared/components/ui/Button.vue'
import { useLanguage } from '@/shared/composables/useLanguage'
import { useNotificationCount } from '@/shared/composables/useNotificationCount'
import { useOnlineStatus } from '@/shared/composables/useOnlineStatus'

const { t } = useI18n()
const route = useRoute()
const { toggleLanguage } = useLanguage()
const { unreadCount } = useNotificationCount()
const { isOnline } = useOnlineStatus()

const title = computed(() => {
  const key = route.meta.titleKey
  return typeof key === 'string' ? t(key) : ''
})

const badgeText = computed(() => (unreadCount.value > 99 ? '99+' : String(unreadCount.value)))

const bellLabel = computed(() =>
  unreadCount.value > 0
    ? t('notifications.labelNew', { count: unreadCount.value })
    : t('notifications.labelNone')
)
</script>

<template>
  <PageHeader :title="title">
    <template #actions>
      <Button variant="secondary" size="sm" :aria-label="bellLabel">
        <svg
          class="h-[1.25rem] w-[1.25rem]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9zM10 21a2 2 0 0 0 4 0" />
        </svg>
        <span
          v-if="unreadCount > 0"
          class="min-w-[1.25rem] rounded-full bg-primary px-s-1 text-center text-caption font-semibold text-primary-foreground"
          aria-hidden="true"
        >
          {{ badgeText }}
        </span>
      </Button>

      <span
        class="inline-flex h-small items-center gap-s-2 rounded-full border border-border bg-card px-s-3 text-caption font-medium text-foreground"
      >
        <span
          class="h-[0.5rem] w-[0.5rem] rounded-full"
          :class="isOnline ? 'bg-success' : 'bg-warning'"
          aria-hidden="true"
        />
        {{ isOnline ? t('network.online') : t('network.offline') }}
      </span>

      <Button
        variant="secondary"
        size="sm"
        class="min-w-[2.75rem]"
        :aria-label="t('common.toggleLanguage')"
        @click="toggleLanguage"
      >
        {{ t('language.toggleLabel') }}
      </Button>
    </template>
  </PageHeader>
</template>
