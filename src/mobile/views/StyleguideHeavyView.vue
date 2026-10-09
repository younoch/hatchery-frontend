<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import bnHeavy from './heavy.bn.json'
import enHeavy from './heavy.en.json'

import Card from '@/shared/components/Card.vue'
import Metric from '@/shared/components/Metric.vue'
import Button from '@/shared/components/ui/Button.vue'
import Field from '@/shared/components/ui/Field.vue'
import Input from '@/shared/components/ui/Input.vue'
import Select from '@/shared/components/ui/Select.vue'
import FieldGrid from '@/shared/components/layout/FieldGrid.vue'
import FormSection from '@/shared/components/layout/FormSection.vue'
import PageBody from '@/shared/components/layout/PageBody.vue'
import PageHeader from '@/shared/components/layout/PageHeader.vue'
import SectionStack from '@/shared/components/layout/SectionStack.vue'
import StickyActionBar from '@/shared/components/layout/StickyActionBar.vue'
import { useLanguage } from '@/shared/composables/useLanguage'
import { i18n } from '@/shared/i18n'

i18n.global.mergeLocaleMessage('bn', { heavy: bnHeavy })
i18n.global.mergeLocaleMessage('en', { heavy: enHeavy })

const { locale, t, tm } = useI18n()
const { toggleLanguage } = useLanguage()
const h = computed(() => tm('heavy') as typeof bnHeavy)
const languageLabel = computed(() =>
  t(locale.value === 'bn' ? 'heavy.switchToEnglish' : 'heavy.switchToBangla')
)

const batchNo = ref('B-2610-03')
const species = ref('shrimp')
const tank = ref('A1')
const startDate = ref('2026-09-21')
const ph = ref('')
const temp = ref('')
const salinity = ref('')
const oxygen = ref('')
const feedType = ref('feed1')
const amount = ref('')
const times = ref('')
const lastFed = ref('06:30')
const ammonia = ref('')
const nitrite = ref('')
const alk = ref('')
const note = ref('')

const speciesOptions = computed(() => [{ label: h.value.shrimp, value: 'shrimp' }])
const tankOptions = computed(() => [
  { label: 'Tank A1', value: 'A1' },
  { label: 'Tank A2', value: 'A2' },
  { label: 'Tank B1', value: 'B1' },
  { label: h.value.pond3, value: 'P3' },
])
const feedOptions = computed(() => [
  { label: h.value.feed1, value: 'feed1' },
  { label: h.value.feed2, value: 'feed2' },
  { label: h.value.feed3, value: 'feed3' },
])
</script>

<template>
  <PageBody>
    <SectionStack>
      <PageHeader :title="h.title">
        <template #actions>
          <Button type="button" variant="secondary" size="sm" @click="toggleLanguage">
            {{ languageLabel }}
          </Button>
        </template>
      </PageHeader>

      <Card>
        <FieldGrid :cols="2">
          <Metric :label="h.mAge" :value="12" :unit="h.uDays" />
          <Metric :label="h.mAlive" :value="86" unit="%" />
          <Metric :label="h.mFed" :value="4" :unit="h.uTimes" />
          <Metric :label="h.mCount" value="120,000" />
          <Metric label="pH" :value="8.1" />
          <Metric :label="h.mTemp" :value="29.5" unit="°C" />
          <Metric :label="h.mSal" :value="22" unit="ppt" />
          <Metric label="O₂" :value="5.4" unit="mg/L" />
        </FieldGrid>
      </Card>

      <FormSection :title="h.secId">
        <FieldGrid :cols="2">
          <Field :label="h.fBatchNo">
            <template #default="{ id }"><Input :id="id" v-model="batchNo" /></template>
          </Field>
          <Field :label="h.fSpecies">
            <template #default="{ id, errorId }">
              <Select :id="id" v-model="species" :options="speciesOptions" :error-id="errorId" />
            </template>
          </Field>
          <Field :label="h.fTank">
            <template #default="{ id, errorId }">
              <Select :id="id" v-model="tank" :options="tankOptions" :error-id="errorId" />
            </template>
          </Field>
          <Field :label="h.fStart">
            <template #default="{ id }"
              ><Input :id="id" v-model="startDate" type="date"
            /></template>
          </Field>
        </FieldGrid>
      </FormSection>

      <FormSection :title="h.secWater">
        <FieldGrid :cols="2">
          <Field label="pH">
            <template #default="{ id }">
              <Input :id="id" v-model="ph" inputmode="decimal" placeholder="8.1" />
            </template>
          </Field>
          <Field :label="h.fTemp">
            <template #default="{ id }">
              <Input :id="id" v-model="temp" inputmode="decimal" unit="°C" placeholder="29.5" />
            </template>
          </Field>
          <Field :label="h.fSalinity">
            <template #default="{ id }">
              <Input :id="id" v-model="salinity" inputmode="decimal" unit="ppt" placeholder="22" />
            </template>
          </Field>
          <Field :label="h.fOxygen">
            <template #default="{ id }">
              <Input :id="id" v-model="oxygen" inputmode="decimal" unit="mg/L" placeholder="5.4" />
            </template>
          </Field>
        </FieldGrid>
      </FormSection>

      <FormSection :title="h.secFeed">
        <FieldGrid :cols="2">
          <Field :label="h.fFeedType">
            <template #default="{ id, errorId }">
              <Select :id="id" v-model="feedType" :options="feedOptions" :error-id="errorId" />
            </template>
          </Field>
          <Field :label="h.fAmount">
            <template #default="{ id }">
              <Input :id="id" v-model="amount" inputmode="decimal" unit="g" placeholder="250" />
            </template>
          </Field>
          <Field :label="h.fTimes">
            <template #default="{ id }">
              <Input
                :id="id"
                v-model="times"
                inputmode="numeric"
                :unit="h.uTimes"
                placeholder="4"
              />
            </template>
          </Field>
          <Field :label="h.fLastFed">
            <template #default="{ id }"><Input :id="id" v-model="lastFed" type="time" /></template>
          </Field>
        </FieldGrid>
      </FormSection>

      <FormSection :title="h.secMore" :default-open="false">
        <SectionStack>
          <FieldGrid :cols="2">
            <Field :label="h.fAmmonia">
              <template #default="{ id }">
                <Input
                  :id="id"
                  v-model="ammonia"
                  inputmode="decimal"
                  unit="mg/L"
                  placeholder="0.1"
                />
              </template>
            </Field>
            <Field :label="h.fNitrite">
              <template #default="{ id }">
                <Input
                  :id="id"
                  v-model="nitrite"
                  inputmode="decimal"
                  unit="mg/L"
                  placeholder="0.05"
                />
              </template>
            </Field>
            <Field :label="h.fAlk">
              <template #default="{ id }">
                <Input :id="id" v-model="alk" inputmode="decimal" unit="mg/L" placeholder="120" />
              </template>
            </Field>
          </FieldGrid>
          <FieldGrid :cols="1">
            <Field :label="h.fNote" :hint="h.optional">
              <template #default="{ id }"
                ><Input :id="id" v-model="note" maxlength="200"
              /></template>
            </Field>
          </FieldGrid>
        </SectionStack>
      </FormSection>

      <StickyActionBar status-key="heavy.demoNote">
        <Button type="button" variant="red-outline">{{ h.cancel }}</Button>
        <Button type="button">{{ h.save }}</Button>
      </StickyActionBar>
    </SectionStack>
  </PageBody>
</template>
