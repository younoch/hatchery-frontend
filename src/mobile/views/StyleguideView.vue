<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import bnStyleguide from './styleguide.bn.json'
import enStyleguide from './styleguide.en.json'

import { useToast } from '@/shared/composables/useToast'

import Card from '@/shared/components/Card.vue'
import Metric from '@/shared/components/Metric.vue'
import StatusBadge from '@/shared/components/StatusBadge.vue'
import Button from '@/shared/components/ui/Button.vue'
import Field from '@/shared/components/ui/Field.vue'
import Input from '@/shared/components/ui/Input.vue'
import Select from '@/shared/components/ui/Select.vue'
import Sheet from '@/shared/components/ui/Sheet.vue'
import StepperInput from '@/shared/components/ui/StepperInput.vue'
import Tabs from '@/shared/components/ui/Tabs.vue'
import CardList from '@/shared/components/layout/CardList.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import FormSection from '@/shared/components/layout/FormSection.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import PageHeader from '@/shared/components/layout/PageHeader.vue'
import SectionStack from '@/shared/components/layout/SectionStack.vue'
import ToastHost from '@/shared/components/ToastHost.vue'
import StickyActionBar from '@/shared/components/layout/StickyActionBar.vue'
import { useLanguage } from '@/shared/composables/useLanguage'
import { i18n } from '@/shared/i18n'

i18n.global.mergeLocaleMessage('bn', { styleguide: bnStyleguide })
i18n.global.mergeLocaleMessage('en', { styleguide: enStyleguide })

const { locale, t, tm } = useI18n()
const { toggleLanguage } = useLanguage()

const currentStyleguide = computed(() => tm('styleguide') as typeof bnStyleguide)

const tabValue = ref('buttons')
const notes = ref('')
const sheetOpen = ref(false)
const temperature = ref('24.5')
const selectValue = ref('blue')
const stepperValue = ref(22)
const unconfirmedStepperValue = ref(24)
const disabledStepperValue = ref(24)
const tabItems = computed(() => [
  { label: currentStyleguide.value.overview, value: 'overview' },
  { label: currentStyleguide.value.history, value: 'history' },
  { label: currentStyleguide.value.details, value: 'details' },
])

const selectOptions = computed(() => [
  { label: currentStyleguide.value.optionA, value: 'blue' },
  { label: currentStyleguide.value.optionB, value: 'green' },
  { label: currentStyleguide.value.optionC, value: 'amber' },
])

const exampleMetrics = computed(() => [
  { label: currentStyleguide.value.statusReady, value: 24.5, unit: '°C' },
  { label: currentStyleguide.value.statusOxygen, value: 6.8, unit: 'mg/L' },
  { label: currentStyleguide.value.statusSalinity, value: 30, unit: 'ppt' },
])
const syncStatuses = ['pending', 'syncing', 'failed', 'synced'] as const
const languageLabel = computed(() =>
  t(locale.value === 'bn' ? 'styleguide.switchToEnglish' : 'styleguide.switchToBangla')
)
const toast = useToast()
</script>

<template>
  <PageBody>
    <SectionStack>
      <PageHeader :title="currentStyleguide.title">
        <template #actions>
          <Button type="button" variant="secondary" size="sm" @click="toggleLanguage">
            {{ languageLabel }}
          </Button>
        </template>
      </PageHeader>
      <FormSection :title="currentStyleguide.statusBadges" :default-open="true">
        <FieldGrid :cols="2">
          <div v-for="status in syncStatuses" :key="status">
            <StatusBadge :status="status" />
          </div>
        </FieldGrid>
      </FormSection>
      <FormSection :title="currentStyleguide.buttons" :default-open="true">
        <FieldGrid :cols="2">
          <Button type="button">{{ currentStyleguide.primary }}</Button>
          <Button type="button" variant="secondary">{{ currentStyleguide.secondary }}</Button>
          <Button type="button" variant="red-outline">{{ currentStyleguide.cancel }}</Button>
          <Button type="button" size="sm" variant="secondary">{{ currentStyleguide.small }}</Button>
          <Button type="button" disabled>{{ currentStyleguide.disabled }}</Button>
          <Button type="button" variant="secondary" disabled>
            {{ currentStyleguide.secondaryDisabled }}
          </Button>
        </FieldGrid>
      </FormSection>

      <FormSection :title="currentStyleguide.fields" :default-open="true">
        <FieldGrid :cols="2">
          <Field :label="currentStyleguide.temperatureLabel" :hint="currentStyleguide.hint">
            <template #default="{ id }">
              <Input :id="id" v-model="temperature" unit="°C" />
            </template>
          </Field>

          <Field :label="currentStyleguide.selectLabel" :hint="currentStyleguide.hint">
            <template #default="{ id, errorId }">
              <Select :id="id" v-model="selectValue" :options="selectOptions" :error-id="errorId" />
            </template>
          </Field>

          <Field :label="currentStyleguide.notesLabel" :hint="currentStyleguide.optional">
            <template #default="{ id }">
              <Input :id="id" v-model="notes" :placeholder="currentStyleguide.placeholder" />
            </template>
          </Field>
        </FieldGrid>

        <FieldGrid :cols="1">
          <StepperInput v-model="stepperValue" :label="currentStyleguide.stepperLabel" unit="°C" :step="1" :min="0"
            :max="60" />
          <StepperInput v-model="unconfirmedStepperValue" :label="currentStyleguide.unconfirmedStepperLabel"
            :hint="currentStyleguide.lastValue" unit="°C" :step="1" :min="0" :max="60" unconfirmed />
          <StepperInput v-model="disabledStepperValue" :label="currentStyleguide.disabledStepperLabel" unit="°C"
            :step="1" :min="0" :max="60" disabled />
        </FieldGrid>
      </FormSection>

      <FormSection :title="currentStyleguide.tabs" :default-open="true">
        <Tabs v-model="tabValue" :items="tabItems">
          <template #content-overview>
            <Card>
              {{ currentStyleguide.tabOverview }}
            </Card>
          </template>
          <template #content-history>
            <Card>
              {{ currentStyleguide.tabHistory }}
            </Card>
          </template>
          <template #content-details>
            <Card>
              {{ currentStyleguide.tabDetails }}
            </Card>
          </template>
        </Tabs>
      </FormSection>

      <FormSection :title="currentStyleguide.sheet" :default-open="true">
        <Sheet v-model:open="sheetOpen" :title="currentStyleguide.sheetTitle"
          :description="currentStyleguide.sheetDescription">
          <template #trigger>
            <Button type="button" @click="sheetOpen = true">
              {{ currentStyleguide.openSheet }}
            </Button>
          </template>
          <Card>
            {{ currentStyleguide.sheetBody }}
          </Card>
        </Sheet>
      </FormSection>

      <FormSection :title="currentStyleguide.layout" :default-open="true">
        <PageHeader :title="currentStyleguide.subHeader" title-as="h2">
          <template #actions>
            <Button type="button" size="sm" variant="secondary">
              {{ currentStyleguide.filter }}
            </Button>
          </template>
        </PageHeader>

        <FieldGrid :cols="2">
          <Card>
            {{ currentStyleguide.metric }}
          </Card>
          <Card>
            {{ currentStyleguide.lastSync }}
          </Card>
        </FieldGrid>

        <CardList as="div">
          <div v-for="metric in exampleMetrics" :key="metric.label">
            <Card>
              <Metric :label="metric.label" :value="metric.value" :unit="metric.unit" />
            </Card>
          </div>
        </CardList>
      </FormSection>

      <StickyActionBar status-key="styleguide.savedLocally">
        <Button type="button" variant="red-outline">{{ currentStyleguide.cancel }}</Button>
        <Button type="button">{{ currentStyleguide.save }}</Button>
      </StickyActionBar>
      <FormSection :title="currentStyleguide.toast" :default-open="true">
        <FieldGrid :cols="1">
          <Button type="button" variant="secondary" @click="toast.error('auth.error.invalidCredentials')">
            {{ currentStyleguide.toastError }}
          </Button>
          <Button type="button" variant="secondary" @click="toast.success('water.saved')">
            {{ currentStyleguide.toastSuccess }}
          </Button>
          <Button type="button" variant="secondary" @click="toast.info('water.cancelled')">
            {{ currentStyleguide.toastInfo }}
          </Button>
        </FieldGrid>
      </FormSection>
    </SectionStack>
    <ToastHost/>
  </PageBody>
</template>
