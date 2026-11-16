<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import Button from '@/shared/components/ui/Button.vue'
import Card from '@/shared/components/Card.vue'
import CardList from '@/shared/components/layout/CardList.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import StateMessage from '@/shared/components/layout/StateMessage.vue'
import { ApiError } from '@/shared/api/apiError'
import { errorMessageKey } from '@/shared/api/errorKey'
import { fetchOrganizationRoles } from '@/shared/api/organizationRolesApi'
import { shownPermissionCount } from '@/shared/config/permissions'
import { useAuthStore } from '@/shared/stores/authStore'
import { useRoleStore } from '@/shared/stores/roleStore'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const { items } = storeToRefs(useRoleStore())

function edit(id: string): void {
  void router.push(`/m/manage/roles/${id}`)
}

const canUse = computed(
  () => auth.canUseOrganization && auth.hasPermission('organization-role:write'),
)
const loading = ref(false)
const errorKey = ref<string | null>(null)

// Online only: the roles are not cached.
async function load(): Promise<void> {
  if (!navigator.onLine) {
    errorKey.value = 'manage.needsInternet'
    return
  }
  loading.value = true
  errorKey.value = null
  try {
    items.value = await fetchOrganizationRoles()
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') await auth.clearSession()
    errorKey.value = error.kind === 'network' ? 'manage.needsInternet' : errorMessageKey(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (canUse.value) void load()
})
</script>

<template>
  <StateMessage v-if="!canUse">{{ t('manage.noAccess') }}</StateMessage>
  <StateMessage v-else-if="errorKey && items.length === 0">
    {{ t(errorKey) }}
    <template #action>
      <Button :disabled="loading" @click="load">{{ t('manage.retry') }}</Button>
    </template>
  </StateMessage>
  <PageBody v-else>
    <p v-if="loading && items.length === 0" class="text-center text-caption text-muted-foreground">
      {{ t('manage.loading') }}
    </p>
    <CardList v-else :empty="items.length === 0" empty-key="manage.noRoles">
      <li v-for="role in items" :key="role.id">
        <Card>
          <FieldGrid :cols="1">
            <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
              {{ role.name }}
            </p>
            <p class="text-caption text-muted-foreground">
              {{ t('manage.permissionCount', { count: shownPermissionCount(role.permissions) }) }}
            </p>
            <p v-if="!role.editable" class="text-caption text-muted-foreground">
              {{ t('manage.readOnlyRole') }}
            </p>
            <Button v-else variant="secondary" size="sm" @click="edit(role.id)">
              {{ t('manage.edit') }}
            </Button>
          </FieldGrid>
        </Card>
      </li>
    </CardList>
  </PageBody>
</template>