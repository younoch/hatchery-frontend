<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import Button from '@/shared/components/ui/Button.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import StateMessage from '@/shared/components/layout/StateMessage.vue'
import { useManagementEntries } from '@/shared/composables/useManagementEntries'

const { t } = useI18n()
const router = useRouter()
const entries = useManagementEntries()
</script>

<template>
  <StateMessage v-if="entries.length === 0">{{ t('manage.noAccess') }}</StateMessage>
  <PageBody v-else>
    <FieldGrid :cols="1">
      <Button
        v-for="entry in entries"
        :key="entry.id"
        variant="secondary"
        class="justify-start"
        @click="router.push(entry.path)"
      >
        {{ t(entry.labelKey) }}
      </Button>
    </FieldGrid>
  </PageBody>
</template>