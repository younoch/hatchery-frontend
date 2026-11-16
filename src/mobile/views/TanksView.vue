<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import Button from '@/shared/components/ui/Button.vue'
import Card from '@/shared/components/Card.vue'
import CardList from '@/shared/components/layout/CardList.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import StateMessage from '@/shared/components/layout/StateMessage.vue'
import { useAuthStore } from '@/shared/stores/authStore'
import { useTankStore } from '@/shared/stores/tankStore'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const tankStore = useTankStore()

const canSee = computed(
  () =>
    auth.canUseOrganization && (auth.hasPermission('tank:create') || auth.hasPermission('tank:write')),
)
const canCreate = computed(() => auth.hasPermission('tank:create'))
const canEdit = computed(() => auth.hasPermission('tank:write'))

function edit(id: string): void {
  void router.push(`/m/manage/tanks/${id}`)
}

// The list comes from the tank cache (inactive tanks included); opening the page asks for a
// fresher one (at most once every 10 minutes, the store enforces it).
onMounted(() => {
  if (canSee.value) void tankStore.refresh()
})
</script>

<template>
  <StateMessage v-if="!canSee">{{ t('manage.noAccess') }}</StateMessage>
  <PageBody v-else>
    <FieldGrid v-if="canCreate" :cols="1">
      <Button variant="secondary" @click="router.push('/m/manage/tanks/new')">
        {{ t('manage.newTank') }}
      </Button>
    </FieldGrid>
    <CardList :empty="tankStore.tanks.length === 0" empty-key="manage.noTanks">
      <li v-for="tank in tankStore.tanks" :key="tank.id">
        <Card>
          <FieldGrid :cols="1">
            <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
              {{ tank.name }}
            </p>
            <p v-if="!tank.isActive" class="text-caption font-medium text-sync-failed">
              {{ t('manage.inactive') }}
            </p>
            <Button v-if="canEdit" variant="secondary" size="sm" @click="edit(tank.id)">
              {{ t('manage.edit') }}
            </Button>
          </FieldGrid>
        </Card>
      </li>
    </CardList>
  </PageBody>
</template>