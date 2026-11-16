<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

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
import { createTank, updateTank } from '@/shared/api/tanksApi'
import { useToast } from '@/shared/composables/useToast'
import { tankFormSchema } from '@/shared/schemas/tankForm.schema'
import { useAuthStore } from '@/shared/stores/authStore'
import { useTankStore } from '@/shared/stores/tankStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const tankStore = useTankStore()

// The same page creates a tank (no id in the path) or edits one.
const tankId = computed(() => (typeof route.params.id === 'string' ? route.params.id : undefined))
const tank = computed(() => tankStore.tanks.find(item => item.id === tankId.value))
const canUse = computed(
  () => auth.canUseOrganization && auth.hasPermission(tankId.value ? 'tank:write' : 'tank:create'),
)
const saving = ref(false)

const statusOptions = computed(() => [
  { label: t('manage.active'), value: 'active' },
  { label: t('manage.inactive'), value: 'inactive' },
])

const { errors, defineField, handleSubmit, setFieldError, resetForm } = useForm({
  validationSchema: toTypedSchema(tankFormSchema),
  initialValues: { name: '', status: 'active' as 'active' | 'inactive' },
})

const config = { validateOnModelUpdate: false }
const [name] = defineField('name', config)
const [status] = defineField('status', config)

function done(): void {
  void router.replace('/m/manage/tanks')
}

const onSubmit = handleSubmit(async values => {
  // Editing sends only what changed.
  const changes: { name?: string; isActive?: boolean } = {}
  if (tankId.value) {
    const current = tank.value
    if (!current) return
    if (values.name !== current.name) changes.name = values.name
    const active = values.status === 'active'
    if (active !== current.isActive) changes.isActive = active
    if (Object.keys(changes).length === 0) {
      done()
      return
    }
  }

  if (!navigator.onLine) {
    toast.error('manage.needsInternet')
    return
  }
  saving.value = true
  try {
    if (tankId.value) await updateTank(tankId.value, changes)
    else await createTank({ name: values.name })
    await tankStore.refresh(true) // the reading form and the list show the change at once
    toast.success('manage.saved')
    done()
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') {
      await auth.clearSession()
      return
    }
    const messages = fieldMessages(error, ['name'])
    if (messages.name) setFieldError('name', messages.name)
    else toast.error(errorMessageKey(error))
  } finally {
    saving.value = false
  }
})

onMounted(() => {
  if (!canUse.value || !tankId.value) return
  // After a reload the cache may not have the tank yet: back to the list.
  const current = tank.value
  if (!current) {
    done()
    return
  }
  resetForm({ values: { name: current.name, status: current.isActive ? 'active' : 'inactive' } })
})
</script>

<template>
  <StateMessage v-if="!canUse">{{ t('manage.noAccess') }}</StateMessage>
  <form v-else class="flex flex-1 flex-col justify-between" novalidate @submit.prevent="onSubmit">
    <PageBody>
      <FieldGrid :cols="1">
        <Field :label="t('manage.tankName')" :error-key="errors.name" required>
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
        <Field
          v-if="tankId"
          :label="t('manage.status')"
          :hint="t('manage.tankStatusHint')"
          :error-key="errors.status"
        >
          <template #default="{ id, errorId, hasError }">
            <Select
              :id="id"
              v-model="status"
              :options="statusOptions"
              :invalid="hasError"
              :error-id="errorId"
            />
          </template>
        </Field>
      </FieldGrid>
    </PageBody>
    <StickyActionBar>
      <Button type="submit" :disabled="saving">
        {{ t(tankId ? 'common.save' : 'manage.create') }}
      </Button>
      <Button type="button" variant="secondary" :disabled="saving" @click="done">
        {{ t('common.cancel') }}
      </Button>
    </StickyActionBar>
  </form>
</template>