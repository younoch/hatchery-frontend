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
import { fetchUsers } from '@/shared/api/usersApi'
import { useToast } from '@/shared/composables/useToast'
import { isOrgAdmin } from '@/shared/lib/userRole'
import type { ManagedUser } from '@/shared/schemas/user.schema'
import { useAuthStore } from '@/shared/stores/authStore'
import { useUserStore } from '@/shared/stores/userStore'

const PAGE_SIZE = 20

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToast()
const router = useRouter()
const canCreate = computed(() => auth.hasPermission('user:create'))
const canEdit = computed(() => auth.hasPermission('user:write'))

// The admin's own account cannot be changed here (the backend answers cannot_target_self).
function edit(id: string): void {
  void router.push(`/m/manage/users/${id}`)
}

const { items, meta } = storeToRefs(useUserStore())
const loading = ref(false)
const errorKey = ref<string | null>(null) // shown instead of the list while it is empty

// Online only: the list is not cached.
async function load(page: number): Promise<void> {
  if (!navigator.onLine) {
    fail('manage.needsInternet')
    return
  }
  loading.value = true
  errorKey.value = null
  try {
    const result = await fetchUsers({ page, pageSize: PAGE_SIZE })
    items.value = page === 1 ? result.items : [...items.value, ...result.items]
    meta.value = result.meta
  } catch (error) {
    // Anything that is not an ApiError is a bug: let the global handler report it.
    if (!(error instanceof ApiError)) throw error
    if (error.kind === 'session_ended') await auth.clearSession()
    fail(error.kind === 'network' ? 'manage.needsInternet' : errorMessageKey(error))
  } finally {
    loading.value = false
  }
}

// An empty list shows the message in its place; a failed "load more" shows a toast.
function fail(key: string): void {
  if (items.value.length === 0) errorKey.value = key
  else toast.error(key)
}

// The username and the role on one line.
function subtitle(user: ManagedUser): string {
  return `${user.username} · ${user.role?.name ?? t('manage.noRole')}`
}

onMounted(() => void load(1))
</script>

<template>
  <StateMessage v-if="errorKey && items.length === 0">
    {{ t(errorKey) }}
    <template #action>
      <Button :disabled="loading" @click="load(1)">{{ t('manage.retry') }}</Button>
    </template>
  </StateMessage>
  <PageBody v-else>
    <FieldGrid v-if="canCreate" :cols="1">
      <Button variant="secondary" @click="router.push('/m/manage/users/new')">
        {{ t('manage.newUser') }}
      </Button>
    </FieldGrid>
    <p v-if="loading && items.length === 0" class="text-center text-caption text-muted-foreground">
      {{ t('manage.loading') }}
    </p>
    <CardList v-else :empty="items.length === 0" empty-key="manage.noUsers">
      <li v-for="user in items" :key="user.id">
        <Card>
          <FieldGrid :cols="1">
            <p class="text-body font-semibold text-foreground [overflow-wrap:anywhere]">
              {{ user.name || user.username }}
            </p>
            <p class="text-caption text-muted-foreground [overflow-wrap:anywhere]">
              {{ subtitle(user) }}
            </p>
            <p class="text-caption text-muted-foreground [overflow-wrap:anywhere]">
              {{ user.email }}
            </p>
            <p v-if="!user.isActive" class="text-caption font-medium text-sync-failed">
              {{ t('manage.inactive') }}
            </p>
            <p v-if="user.mustChangePassword" class="text-caption font-medium text-sync-pending">
              {{ t('manage.mustChange') }}
            </p>
            <Button v-if="canEdit && user.id !== auth.user?.id && !isOrgAdmin(user)" variant="secondary" size="sm" @click="edit(user.id)">
              {{ t('manage.edit') }}
            </Button>
          </FieldGrid>
        </Card>
      </li>
    </CardList>
    <FieldGrid v-if="meta?.hasNextPage" :cols="1">
      <Button variant="secondary" :disabled="loading" @click="load((meta?.page ?? 1) + 1)">
        {{ t('manage.loadMore') }}
      </Button>
    </FieldGrid>
  </PageBody>
</template>