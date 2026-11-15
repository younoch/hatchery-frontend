<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import Button from '@/shared/components/ui/Button.vue'
import Field from '@/shared/components/ui/Field.vue'
import Input from '@/shared/components/ui/Input.vue'
import Select from '@/shared/components/ui/Select.vue'
import Card from '@/shared/components/Card.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import StateMessage from '@/shared/components/layout/StateMessage.vue'
import StickyActionBar from '@/shared/components/layout/StickyActionBar.vue'
import { ApiError } from '@/shared/api/apiError'
import { errorMessageKey, fieldErrorKey } from '@/shared/api/errorKey'
import { fetchOrganizationRoles } from '@/shared/api/organizationRolesApi'
import { createUser } from '@/shared/api/usersApi'
import { useToast } from '@/shared/composables/useToast'
import { generateTemporaryPassword } from '@/shared/lib/tempPassword'
import { createUserFormSchema } from '@/shared/schemas/createUser.schema'
import type { OrganizationRole } from '@/shared/schemas/organizationRole.schema'
import { useAuthStore } from '@/shared/stores/authStore'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const canCreate = computed(() => auth.canUseOrganization && auth.hasPermission('user:create'))

const roles = ref<OrganizationRole[]>([])
const loadingRoles = ref(false)
const loadErrorKey = ref<string | null>(null)
const saving = ref(false)
// The new user and the temporary password, shown once after the user is created. Never stored.
const created = ref<{ username: string; password: string } | null>(null)

// The `admin` role is not offered: an organization has one admin, made by the super admin.
const roleOptions = computed(() =>
  roles.value.filter(role => role.editable).map(role => ({ label: role.name, value: role.roleId })),
)

const { errors, defineField, handleSubmit, setFieldError, setFieldValue } = useForm({
  validationSchema: toTypedSchema(createUserFormSchema),
  initialValues: {
    username: '',
    email: '',
    name: '',
    roleId: '',
    temporaryPassword: generateTemporaryPassword(),
  },
})

const config = { validateOnModelUpdate: false }
const [username] = defineField('username', config)
const [email] = defineField('email', config)
const [name] = defineField('name', config)
const [roleId] = defineField('roleId', config)
const [temporaryPassword] = defineField('temporaryPassword', config)

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

function newPassword(): void {
  setFieldValue('temporaryPassword', generateTemporaryPassword(), false)
}

// Shows what the backend said next to the fields it named; otherwise a message.
function showError(error: ApiError): void {
  const named = error.errors.filter(item => item.field in createUserFormSchema.shape)
  for (const item of named) setFieldError(item.field as keyof typeof createUserFormSchema.shape, fieldErrorKey(item.field, item.code))
  if (error.code === 'username_taken') setFieldError('username', fieldErrorKey('username', 'username_taken'))
  else if (error.code === 'email_taken') setFieldError('email', fieldErrorKey('email', 'email_taken'))
  else if (named.length === 0) toast.error(errorMessageKey(error))
}

const onSubmit = handleSubmit(async values => {
  if (!navigator.onLine) {
    toast.error('manage.needsInternet')
    return
  }
  saving.value = true
  try {
    await createUser({
      username: values.username,
      email: values.email,
      ...(values.name ? { name: values.name } : {}),
      roleId: values.roleId,
      temporaryPassword: values.temporaryPassword,
    })
    created.value = { username: values.username, password: values.temporaryPassword }
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') {
      await auth.clearSession()
      return
    }
    showError(error)
  } finally {
    saving.value = false
  }
})

async function copyPassword(): Promise<void> {
  if (!created.value) return
  try {
    await navigator.clipboard.writeText(created.value.password)
    toast.success('manage.copied')
  } catch {
    toast.error('manage.copyFailed')
  }
}

function done(): void {
  void router.replace('/m/manage/users')
}

onMounted(() => {
  if (canCreate.value) void loadRoles()
})
</script>

<template>
  <StateMessage v-if="!canCreate">{{ t('manage.noAccess') }}</StateMessage>
  <StateMessage v-else-if="loadErrorKey">
    {{ t(loadErrorKey) }}
    <template #action>
      <Button :disabled="loadingRoles" @click="loadRoles">{{ t('manage.retry') }}</Button>
    </template>
  </StateMessage>
  <PageBody v-else-if="created">
    <Card>
      <FieldGrid :cols="1">
        <p class="text-body font-semibold text-foreground">{{ t('manage.created') }}</p>
        <p class="text-caption text-muted-foreground">{{ t('manage.createdHint') }}</p>
        <p class="text-caption text-muted-foreground">{{ t('manage.username') }}</p>
        <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
          {{ created.username }}
        </p>
        <p class="text-caption text-muted-foreground">{{ t('manage.temporaryPassword') }}</p>
        <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
          {{ created.password }}
        </p>
        <Button @click="copyPassword">{{ t('manage.copyPassword') }}</Button>
        <Button variant="secondary" @click="done">{{ t('manage.done') }}</Button>
      </FieldGrid>
    </Card>
  </PageBody>
  <form v-else class="flex flex-1 flex-col justify-between" novalidate @submit.prevent="onSubmit">
    <PageBody>
      <FieldGrid :cols="1">
        <Field :label="t('manage.username')" :error-key="errors.username" required>
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="username"
              autocomplete="off"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Field :label="t('manage.email')" :error-key="errors.email" required>
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="email"
              type="email"
              inputmode="email"
              autocomplete="off"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Field :label="t('manage.name')" :error-key="errors.name">
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="name"
              autocomplete="off"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Field :label="t('manage.role')" :error-key="errors.roleId" required>
          <template #default="{ id, errorId, hasError }">
            <Select
              :id="id"
              v-model="roleId"
              :options="roleOptions"
              :placeholder="t('manage.chooseRole')"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Field
          :label="t('manage.temporaryPassword')"
          :hint="t('manage.temporaryPasswordHint')"
          :error-key="errors.temporaryPassword"
          required
        >
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="temporaryPassword"
              autocomplete="off"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Button type="button" variant="secondary" size="sm" @click="newPassword">
          {{ t('manage.newPassword') }}
        </Button>
      </FieldGrid>
    </PageBody>
    <StickyActionBar>
      <Button type="submit" :disabled="saving || loadingRoles">{{ t('manage.create') }}</Button>
      <Button type="button" variant="secondary" :disabled="saving" @click="done">
        {{ t('common.cancel') }}
      </Button>
    </StickyActionBar>
  </form>
</template>