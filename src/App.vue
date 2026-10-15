<script setup lang="ts">
import ErrorBoundary from '@/shared/components/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary context="app">
    <RouterView />
  </ErrorBoundary>
</template>
