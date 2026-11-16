<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import ConfirmSheet from '@/shared/components/ConfirmSheet.vue'
import TemporaryPasswordCard from '@/shared/components/TemporaryPasswordCard.vue'
import Button from '@/shared/components/ui/Button.vue'
import Field from '@/shared/components/ui/Field.vue'
import Input from '@/shared/components/ui/Input.vue'
import Select from '@/shared/components/ui/Select.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import StateMessage from '@/shared/components/layout/StateMessage.vue'
import StickyActionBar from '@/shared/components/layout/StickyActionBar.vue'
import { ApiError } from '@/shared/api/apiError'
import { errorMessageKey, fieldMessages } from '@/shared/api/errorKey'
import { fetchOrganizationRoles } from '@/shared/api/organizationRolesApi'
import { resetUserPassword, updateUser } from '@/shared/api/usersApi'
import { useToast } from '@/shared/composables/useToast'
import { generateTemporaryPassword } from '@/shared/lib/tempPassword'
import { isOrgAdmin } from '@/shared/lib/userRole'
import type { OrganizationRole } from '@/shared/schemas/organizationRole.schema'
import { updateUserFormSchema } from '@/shared/schemas/updateUser.schema'
import type { ManagedUser, UpdateUserInput } from '@/shared/schemas/user.schema'
import { useAuthStore } from '@/shared/stores/authStore'
import { useUserStore } from '@/shared/stores/userStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const userStore = useUserStore()

const id = computed(() => String(route.params.id))
const user = computed(() => userStore.find(id.value))
const canWrite = computed(() => auth.canUseOrganization && auth.hasPermission('user:write'))

const roles = ref<OrganizationRole[]>([])
const loadingRoles = ref(false)
const loadErrorKey = ref<string | null>(null)
const saving = ref(false)

// A reset sets a temporary password that the app shows once; it is never stored.
const canReset = computed(() => auth.hasPermission('user:reset-password'))
const resetOpen = ref(false)
const resetting = ref(false)
const resetPassword = ref<string | null>(null)

// The `admin` role is not offered. The user's current role stays in the list, so the select shows it.
const roleOptions = computed(() => {
  const options = roles.value
    .filter(role => role.editable)
    .map(role => ({ label: role.name, value: role.roleId }))
  const current = user.value?.role
  if (current && !options.some(option => option.value === current.id)) {
    options.push({ label: current.name, value: current.id })
  }
  return options
})

const statusOptions = computed(() => [
  { label: t('manage.active'), value: 'active' },
  { label: t('manage.inactive'), value: 'inactive' },
])

const { errors, defineField, handleSubmit, setFieldError, resetForm } = useForm({
  validationSchema: toTypedSchema(updateUserFormSchema),
  initialValues: { name: '', roleId: '', status: 'active' as 'active' | 'inactive' },
})

const config = { validateOnModelUpdate: false }
const [name] = defineField('name', config)
const [roleId] = defineField('roleId', config)
const [status] = defineField('status', config)

function fillForm(current: ManagedUser): void {
  resetForm({
    values: {
      name: current.name ?? '',
      roleId: current.role?.id ?? '',
      status: current.isActive ? 'active' : 'inactive',
    },
  })
}

async function loadRoles(): Promise<void> {
  if (!navigator.onLine) {
    loadErrorKey.value = 'manage.needsInternet'
    return
  }
  loadingRoles.value = true
  loadErrorKey.value = null
  try {
    roles.value = await fetchOrganizationRoles()
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') await auth.clearSession()
    loadErrorKey.value = error.kind === 'network' ? 'manage.needsInternet' : errorMessageKey(error)
  } finally {
    loadingRoles.value = false
  }
}

async function confirmReset(): Promise<void> {
  const current = user.value
  if (!current) return
  if (!navigator.onLine) {
    toast.error('manage.needsInternet')
    resetOpen.value = false
    return
  }
  resetting.value = true
  const password = generateTemporaryPassword()
  try {
    await resetUserPassword(current.id, password)
    resetPassword.value = password
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') {
      await auth.clearSession()
      return
    }
    toast.error(errorMessageKey(error))
  } finally {
    resetting.value = false
    resetOpen.value = false
  }
}

function done(): void {
  void router.replace('/m/manage/users')
}

const onSubmit = handleSubmit(async values => {
  const current = user.value
  if (!current) return

  // Only what changed is sent.
  const changes: UpdateUserInput = {}
  if (values.name !== (current.name ?? '')) changes.name = values.name
  if (values.roleId !== (current.role?.id ?? '')) changes.roleId = values.roleId
  const active = values.status === 'active'
  if (active !== current.isActive) changes.isActive = active
  if (Object.keys(changes).length === 0) {
    done()
    return
  }

  if (!navigator.onLine) {
    toast.error('manage.needsInternet')
    return
  }
  saving.value = true
  try {
    userStore.replace(await updateUser(current.id, changes))
    toast.success('manage.saved')
    done()
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') {
      await auth.clearSession()
      return
    }
    const messages = fieldMessages(error, ['name', 'roleId', 'isActive'])
    const entries = Object.entries(messages)
    for (const [field, key] of entries) {
      setFieldError(field === 'isActive' ? 'status' : (field as 'name' | 'roleId'), key)
    }
    if (entries.length === 0) toast.error(errorMessageKey(error))
  } finally {
    saving.value = false
  }
})

onMounted(() => {
  if (!canWrite.value) return
  // After a reload the store is empty, and the admin's own account cannot be changed here.
  const current = user.value
  if (!current || current.id === auth.user?.id || isOrgAdmin(current)) {
    done()
    return
  }
  fillForm(current)
  void loadRoles()
})
</script>

<template>
  <StateMessage v-if="!canWrite">{{ t('manage.noAccess') }}</StateMessage>
  <StateMessage v-else-if="loadErrorKey">
    {{ t(loadErrorKey) }}
    <template #action>
      <Button :disabled="loadingRoles" @click="loadRoles">{{ t('manage.retry') }}</Button>
    </template>
  </StateMessage>
  <PageBody v-else-if="resetPassword">
    <TemporaryPasswordCard
      :title="t('manage.resetDone')"
      :hint="t('manage.resetHint')"
      :password="resetPassword"
      @done="done"
    />
  </PageBody>
  <form
    v-else-if="user"
    class="flex flex-1 flex-col justify-between"
    novalidate
    @submit.prevent="onSubmit"
  >
    <PageBody>
      <FieldGrid :cols="1">
        <p class="text-caption text-muted-foreground">{{ t('manage.username') }}</p>
        <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
          {{ user.username }}
        </p>
        <p class="text-caption text-muted-foreground">{{ t('manage.email') }}</p>
        <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
          {{ user.email }}
        </p>
        <Field :label="t('manage.name')" :error-key="errors.name">
          <template #default="{ id: fieldId, errorId, hasError }">
            <Input
              :id="fieldId"
              v-model="name"
              autocomplete="off"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Field :label="t('manage.role')" :error-key="errors.roleId">
          <template #default="{ id: fieldId, errorId, hasError }">
            <Select
              :id="fieldId"
              v-model="roleId"
              :options="roleOptions"
              :placeholder="t('manage.chooseRole')"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Field
          :label="t('manage.status')"
          :hint="t('manage.statusHint')"
          :error-key="errors.status"
        >
          <template #default="{ id: fieldId, errorId, hasError }">
            <Select
              :id="fieldId"
              v-model="status"
              :options="statusOptions"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Button
          v-if="canReset"
          type="button"
          variant="red-outline"
          size="sm"
          @click="resetOpen = true"
        >
          {{ t('manage.resetButton') }}
        </Button>
      </FieldGrid>
    </PageBody>
    <StickyActionBar>
      <Button type="submit" :disabled="saving || loadingRoles">{{ t('common.save') }}</Button>
      <Button type="button" variant="secondary" :disabled="saving" @click="done">
        {{ t('common.cancel') }}
      </Button>
    </StickyActionBar>
  </form>
  <ConfirmSheet
    v-model:open="resetOpen"
    :title="t('manage.resetTitle')"
    :message="t('manage.resetMessage')"
    :confirm-label="t('manage.resetConfirm')"
    :cancel-label="t('manage.resetCancel')"
    :busy="resetting"
    @confirm="confirmReset"
  />
</template>