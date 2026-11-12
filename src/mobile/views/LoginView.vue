<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import { ApiError } from '@/shared/api/apiError'
import { errorMessageKey } from '@/shared/api/errorKey'
import { safeRedirect } from '@/shared/lib/safeRedirect'
import { loginFormSchema } from '@/shared/schemas/login.schema'
import { useAuthStore } from '@/shared/stores/authStore'
import ToastHost from '@/shared/components/ToastHost.vue'
import { useToast } from '@/shared/composables/useToast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(loginFormSchema),
  initialValues: { username: '', password: '' },
})

const config = { validateOnModelUpdate: false }
const [username] = defineField('username', config)
const [password] = defineField('password', config)

const submitting = ref(false)

const onSubmit = handleSubmit(async values => {
  toast.dismiss()
  submitting.value = true
  try {
    await auth.login(values)
    await router.replace(safeRedirect(route.query.redirect))
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    toast.error(errorMessageKey(error))
  } finally {
    submitting.value = false
  }
})
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <PageHeader :title="t('auth.login.title')" />
    <PageBody>
      <FieldGrid :cols="1">
        <Field :label="t('auth.login.username')" :error-key="errors.username">
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="username"
              type="text"
              autocomplete="username"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
        <Field :label="t('auth.login.password')" :error-key="errors.password">
          <template #default="{ id, errorId, hasError }">
            <Input
              :id="id"
              v-model="password"
              type="password"
              autocomplete="current-password"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
      </FieldGrid>
    </PageBody>
    <StickyActionBar>
      <Button type="submit" :disabled="submitting">
        {{ t(submitting ? 'auth.login.submitting' : 'auth.login.submit') }}
      </Button>
    </StickyActionBar>
  </form>
  <ToastHost />
</template>