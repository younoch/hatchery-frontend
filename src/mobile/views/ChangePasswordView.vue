<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import Button from '@/shared/components/ui/Button.vue'
import Field from '@/shared/components/ui/Field.vue'
import Input from '@/shared/components/ui/Input.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import PageHeader from '@/shared/components/layout/PageHeader.vue'
import StickyActionBar from '@/shared/components/layout/StickyActionBar.vue'
import ToastHost from '@/shared/components/ToastHost.vue'
import { ApiError } from '@/shared/api/apiError'
import { errorMessageKey } from '@/shared/api/errorKey'
import { useToast } from '@/shared/composables/useToast'
import { changePasswordFormSchema } from '@/shared/schemas/changePassword.schema'
import { useAuthStore } from '@/shared/stores/authStore'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(changePasswordFormSchema),
  initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
})

const config = { validateOnModelUpdate: false }
const [currentPassword] = defineField('currentPassword', config)
const [newPassword] = defineField('newPassword', config)
const [confirmPassword] = defineField('confirmPassword', config)

const submitting = ref(false)

const onSubmit = handleSubmit(async values => {
  toast.dismiss()
  submitting.value = true
  try {
    await auth.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
    toast.success('auth.changePassword.success')
    await router.replace('/m/water')
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') {
      // The refresh failed too, so the session is over: back to the login screen.
      await auth.clearSession()
      await router.replace('/m/login')
      return
    }
    // On this endpoint only, 403 permission_denied means the current password is wrong.
    const wrongCurrent = error.code === 'permission_denied'
    toast.error(wrongCurrent ? 'auth.changePassword.wrongCurrent' : errorMessageKey(error))
  } finally {
    submitting.value = false
  }
})

async function logout() {
  await auth.logout()
  await router.replace('/m/login')
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <PageHeader :title="t('auth.changePassword.title')" />
    <PageBody>
      <p class="text-body text-muted-foreground">{{ t('auth.changePassword.hint') }}</p>
      <FieldGrid :cols="1">
        <Field :label="t('auth.changePassword.current')" :error-key="errors.currentPassword">
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="currentPassword"
              type="password"
              autocomplete="current-password"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Field :label="t('auth.changePassword.new')" :error-key="errors.newPassword">
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Field :label="t('auth.changePassword.confirm')" :error-key="errors.confirmPassword">
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
      </FieldGrid>
    </PageBody>
    <StickyActionBar>
      <Button type="submit" :disabled="submitting">
        {{ t(submitting ? 'auth.changePassword.submitting' : 'auth.changePassword.submit') }}
      </Button>
      <Button variant="red-outline" :disabled="submitting" @click="logout">
        {{ t('auth.logout') }}
      </Button>
    </StickyActionBar>
  </form>
  <ToastHost />
</template>