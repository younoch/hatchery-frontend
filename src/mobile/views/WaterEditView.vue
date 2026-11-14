<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import WaterEntryView from '@/mobile/views/WaterEntryView.vue'

const route = useRoute()
const id = computed(() => String(route.params.id))
</script>

<template>
  <div class="flex min-h-[100%] flex-col">
    <div class="flex flex-1 flex-col">
      <WaterEntryView :edit-id="id" />
    </div>
  </div>
</template>