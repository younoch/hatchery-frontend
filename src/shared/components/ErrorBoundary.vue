<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '@/shared/components/ui/Button.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import { useErrorStore } from '@/shared/stores/errorStore'

const props = withDefaults(
  defineProps<{
    context?: 'app' | 'view'
  }>(),
  { context: 'view' }
)

const { t } = useI18n()
const { report } = useErrorStore()
const failed = ref(false)
const key = ref(0)

onErrorCaptured((err, _instance, info) => {
  report(err, `ErrorBoundary:${props.context}:${info}`)
  failed.value = true
  return false // stop propagation
})

function retry() {
  failed.value = false
  key.value++
}
</script>

<template>
  <template v-if="!failed">
    <slot :key="key" />
  </template>
  <PageBody v-else>
    <div class="flex flex-col gap-s-3 text-center">
      <p class="text-body text-foreground">{{ t('error.somethingWentWrong') }}</p>
      <p class="text-caption text-muted-foreground">{{ t('error.dataSafe') }}</p>
      <Button type="button" variant="secondary" @click="retry">
        {{ t('error.retry') }}
      </Button>
    </div>
  </PageBody>
</template>
