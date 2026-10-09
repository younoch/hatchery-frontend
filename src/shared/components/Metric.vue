<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  unit?: string
}>()

const englishDigits = computed(() =>
  String(props.value).replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
)
</script>

<template>
  <div>
    <div class="text-caption text-muted-foreground">{{ label }}</div>
    <div class="text-body font-semibold text-foreground">
      {{ englishDigits }}
      <span v-if="unit" class="text-label text-muted-foreground">{{ unit }}</span>
    </div>
  </div>
</template>
