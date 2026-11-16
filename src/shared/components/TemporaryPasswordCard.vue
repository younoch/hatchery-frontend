<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Button from '@/shared/components/ui/Button.vue'
import Card from '@/shared/components/Card.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import { useToast } from '@/shared/composables/useToast'

// Shows a temporary password once, after a user was created or a password was reset, with a copy
// button. The password is never stored: when the admin leaves, it is gone.
const props = defineProps<{ title: string; hint: string; username?: string; password: string }>()
const emit = defineEmits<{ done: [] }>()

const { t } = useI18n()
const toast = useToast()

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.password)
    toast.success('manage.copied')
  } catch {
    toast.error('manage.copyFailed')
  }
}
</script>

<template>
  <Card>
    <FieldGrid :cols="1">
      <p class="text-body font-semibold text-foreground">{{ title }}</p>
      <p class="text-caption text-muted-foreground">{{ hint }}</p>
      <template v-if="username">
        <p class="text-caption text-muted-foreground">{{ t('manage.username') }}</p>
        <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
          {{ username }}
        </p>
      </template>
      <p class="text-caption text-muted-foreground">{{ t('manage.temporaryPassword') }}</p>
      <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
        {{ password }}
      </p>
      <Button @click="copy">{{ t('manage.copyPassword') }}</Button>
      <Button variant="secondary" @click="emit('done')">{{ t('manage.done') }}</Button>
    </FieldGrid>
  </Card>
</template>