<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import Button from '@/shared/components/ui/Button.vue'
import Switch from '@/shared/components/ui/Switch.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import StateMessage from '@/shared/components/layout/StateMessage.vue'
import StickyActionBar from '@/shared/components/layout/StickyActionBar.vue'
import { ApiError } from '@/shared/api/apiError'
import { errorMessageKey } from '@/shared/api/errorKey'
import { updateOrganizationRole } from '@/shared/api/organizationRolesApi'
import { isShownPermission, ORG_PERMISSIONS } from '@/shared/config/permissions'
import { useToast } from '@/shared/composables/useToast'
import { useAuthStore } from '@/shared/stores/authStore'
import { useRoleStore } from '@/shared/stores/roleStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const roleStore = useRoleStore()

const role = computed(() => roleStore.find(String(route.params.id)))
const canUse = computed(
  () => auth.canUseOrganization && auth.hasPermission('organization-role:write'),
)
const saving = ref(false)
// The keys switched on, among the ones the screen shows.
const selected = ref<string[]>([])

function isOn(key: string): boolean {
  return selected.value.includes(key)
}

function toggle(key: string, on: boolean): void {
  selected.value = on ? [...selected.value, key] : selected.value.filter(item => item !== key)
}

function done(): void {
  void router.replace('/m/manage/roles')
}

async function save(): Promise<void> {
  const current = role.value
  if (!current) return

  const before = current.permissions.filter(isShownPermission)
  const unchanged =
    before.length === selected.value.length && before.every(key => selected.value.includes(key))
  if (unchanged) {
    done()
    return
  }

  if (!navigator.onLine) {
    toast.error('manage.needsInternet')
    return
  }
  saving.value = true
  try {
    // The whole list goes to the backend: the keys the screen does not show stay as they are.
    const hidden = current.permissions.filter(key => !isShownPermission(key))
    roleStore.replace(await updateOrganizationRole(current.id, [...hidden, ...selected.value]))
    toast.success('manage.saved')
    done()
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') {
      await auth.clearSession()
      return
    }
    toast.error(errorMessageKey(error))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!canUse.value) return
  // After a reload the store is empty, and the admin role cannot be changed: back to the list.
  const current = role.value
  if (!current || !current.editable) {
    done()
    return
  }
  selected.value = current.permissions.filter(isShownPermission)
})
</script>

<template>
  <StateMessage v-if="!canUse">{{ t('manage.noAccess') }}</StateMessage>
  <form v-else-if="role" class="flex flex-1 flex-col justify-between" @submit.prevent="save">
    <PageBody>
      <FieldGrid :cols="1">
        <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
          {{ role.name }}
        </p>
        <Switch
          v-for="item in ORG_PERMISSIONS"
          :key="item.key"
          :model-value="isOn(item.key)"
          :label="t(item.labelKey)"
          :disabled="!auth.hasPermission(item.key)"
          @update:model-value="toggle(item.key, $event)"
        />
        <p class="text-caption text-muted-foreground">{{ t('manage.cannotGrant') }}</p>
        <p class="text-caption text-muted-foreground">{{ t('manage.rolesHint') }}</p>
      </FieldGrid>
    </PageBody>
    <StickyActionBar>
      <Button type="submit" :disabled="saving">{{ t('common.save') }}</Button>
      <Button type="button" variant="secondary" :disabled="saving" @click="done">
        {{ t('common.cancel') }}
      </Button>
    </StickyActionBar>
  </form>
</template>