<script setup lang="ts">
import { ref } from 'vue'

const lang = ref('en')
</script>

<template>
  <div :lang="lang" class="min-h-screen p-6 bg-background text-foreground">
    <h1 class="text-h1 mb-6">Token Demo</h1>

    <button
      @click="lang = lang === 'en' ? 'bn' : 'en'"
      class="mb-6 px-4 py-2 bg-surface border border-line rounded"
    >
      Toggle Language ({{ lang }})
    </button>

    <section class="mb-8">
      <h2 class="text-h2 mb-4">Spacing Scale</h2>
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-primary rounded"></div>
          <span>s-1 (4px)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-4 bg-primary rounded"></div>
          <span>s-2 (8px)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-12 h-4 bg-primary rounded"></div>
          <span>s-3 (12px)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-16 h-4 bg-primary rounded"></div>
          <span>s-4 (16px)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-24 h-4 bg-primary rounded"></div>
          <span>s-6 (24px)</span>
        </div>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-h2 mb-4">Radius Scale</h2>
      <div class="flex gap-4">
        <div
          class="w-16 h-16 bg-primary rounded-control flex items-center justify-center text-primary-foreground"
        >
          Control (10px)
        </div>
        <div
          class="w-16 h-16 bg-primary rounded-card flex items-center justify-center text-primary-foreground"
        >
          Card (12px)
        </div>
        <div
          class="w-16 h-16 bg-primary rounded-sheet flex items-center justify-center text-primary-foreground"
        >
          Sheet (20px)
        </div>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-h2 mb-4">Type Scale</h2>
      <div class="space-y-2">
        <p class="text-h1">Heading 1 (20px)</p>
        <p class="text-h2">Heading 2 (16px / 18px touch)</p>
        <p class="text-body">Body text (14px / 15px touch)</p>
        <p class="text-body-sm">Body small (13px / 14px touch)</p>
        <p class="text-label">Label (13px / 14px touch)</p>
        <p class="text-caption">Caption (12px)</p>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-h2 mb-4">Control Heights</h2>
      <p class="text-caption mb-2">
        Resize browser to test touch vs mouse (check DevTools device toolbar)
      </p>
      <div class="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Control height"
          class="border border-border rounded-control px-3 h-control"
        />
        <button class="bg-primary text-primary-foreground rounded-control px-4 h-control">
          Button
        </button>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-h2 mb-4">Color Tokens</h2>
      <div class="grid grid-cols-2 gap-2">
        <div class="p-4 bg-primary text-primary-foreground rounded-card">Primary</div>
        <div class="p-4 bg-read-ok text-white rounded-card">Read OK</div>
        <div class="p-4 bg-read-warn text-white rounded-card">Read Warn</div>
        <div class="p-4 bg-read-bad text-white rounded-card">Read Bad</div>
        <div class="p-4 bg-sync-pending text-white rounded-card">Sync Pending</div>
        <div class="p-4 bg-sync-syncing text-white rounded-card">Sync Syncing</div>
        <div class="p-4 bg-sync-failed text-white rounded-card">Sync Failed</div>
        <div class="p-4 bg-sync-synced text-white rounded-card">Sync Synced</div>
        <div class="p-4 bg-muted text-muted-foreground rounded-card">Muted</div>
        <div class="p-4 bg-card border border-border rounded-card">Bg / Surface</div>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-h2 mb-4">Test: Tailwind reset</h2>
      <div class="p-5 bg-read-warn text-white border border-border rounded-card mb-2">
        p-5: should have NO padding (disabled)
      </div>
      <div class="p-7 bg-read-warn text-white border border-border rounded-card mb-2">
        p-7: should have NO padding (disabled)
      </div>
      <div class="gap-10 flex bg-read-warn text-white border border-border rounded-card mb-2">
        gap-10: should have NO gap (disabled)
      </div>
      <div class="text-red-500 bg-read-warn text-white border border-border rounded-card mb-2">
        text-red-500: should have NO style (disabled)
      </div>
      <div class="rounded-lg bg-read-warn text-white border border-border rounded-card mb-2">
        rounded-lg: should have NO radius (disabled)
      </div>
      <div class="p-4 bg-read-ok text-white border border-border rounded-card">
        p-4: should have 16px padding (custom spacing-4)
      </div>
    </section>
  </div>
</template>
