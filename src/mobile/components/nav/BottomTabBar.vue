<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import MoreSheet from '@/mobile/components/nav/MoreSheet.vue'
import { TAB_BAR_HEIGHT } from '@/mobile/nav/layout'
import { navItems } from '@/mobile/nav/navItems'
import { cn } from '@/shared/lib/utils'

const { t } = useI18n()

const columns = computed(() => ({
  gridTemplateColumns: `repeat(${navItems.length + 1}, minmax(0, 1fr))`,
}))

const itemClass = (active: boolean) =>
  cn(
    'flex h-[3.5rem] min-w-[0] flex-col items-center justify-center gap-s-1 rounded-control text-caption font-medium',
    active ? 'text-accent' : 'text-muted-foreground'
  )

const iconClass = (active: boolean) =>
  cn('grid h-[1.75rem] w-[3rem] place-items-center rounded-full', active ? 'bg-primary-50' : '')
</script>

<template>
  <nav
    class="grid shrink-0 border-t border-border bg-card px-s-1 py-s-1"
    :style="columns"
    :aria-label="t('nav.main')"
  >
    <RouterLink
      v-for="item in navItems"
      :key="item.key"
      v-slot="{ href, navigate, isActive }"
      :to="item.to"
      custom
    >
      <a
        :href="href"
        :aria-current="isActive ? 'page' : undefined"
        :class="itemClass(isActive)"
        @click="navigate"
      >
        <span :class="iconClass(isActive)">
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
            <path :d="item.iconPath" />
          </svg>
        </span>
        <span>{{ t(item.labelKey) }}</span>
      </a>
    </RouterLink>

    <MoreSheet :bottom-offset="TAB_BAR_HEIGHT">
      <template #trigger>
        <button type="button" :class="itemClass(false)">
          <span :class="iconClass(false)">
            <svg
              class="h-[1.25rem] w-[1.25rem]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
            </svg>
          </span>
          <span>{{ t('nav.more') }}</span>
        </button>
      </template>
    </MoreSheet>
  </nav>
</template>
