<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { extent } from 'd3-array'
import { scaleLinear, scaleTime } from 'd3-scale'
import { line } from 'd3-shape'

import type { ChartPoint } from '@/shared/lib/chart/chartData'

// A line chart of one metric over time. D3 does the maths (scales and the line), Vue draws the SVG.
// Tapping a point shows its value and time above the chart; the newest point shows by default.
const props = withDefaults(
  defineProps<{
    points: ChartPoint[] // oldest first
    from: Date
    to: Date
    label: string
    unit?: string
    digits?: number
  }>(),
  { unit: '', digits: 1 }
)

const { locale } = useI18n()

const WIDTH = 320
const HEIGHT = 160
const MARGIN = { top: 12, right: 12, bottom: 24, left: 40 }
const innerWidth = WIDTH - MARGIN.left - MARGIN.right
const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom

const x = computed(() => scaleTime().domain([props.from, props.to]).range([0, innerWidth]))

const y = computed(() => {
  const [min, max] = extent(props.points, point => point.value)
  const low = min ?? 0
  const high = max ?? 1
  // A flat line (one point, or the same value) still needs a range to stand in.
  const pad = low === high ? 1 : (high - low) * 0.15
  return scaleLinear()
    .domain([low - pad, high + pad])
    .nice(3)
    .range([innerHeight, 0])
})

const path = computed(
  () =>
    line<ChartPoint>()
      .x(point => x.value(point.time))
      .y(point => y.value(point.value))(props.points) ?? ''
)

const yTicks = computed(() => y.value.ticks(3))
const xTicks = computed(() => x.value.ticks(4))

const tag = computed(() => (locale.value === 'bn' ? 'bn-BD-u-nu-latn' : 'en-GB'))
const dayFormat = computed(
  () => new Intl.DateTimeFormat(tag.value, { day: 'numeric', month: 'short' })
)
const timeFormat = computed(
  () =>
    new Intl.DateTimeFormat(tag.value, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
)

const selectedId = ref<string | null>(null)
const selected = computed(
  () =>
    props.points.find(point => point.readingId === selectedId.value) ??
    props.points[props.points.length - 1]
)

const valueText = computed(() =>
  selected.value ? `${selected.value.value.toFixed(props.digits)} ${props.unit}`.trim() : ''
)
const timeText = computed(() => (selected.value ? timeFormat.value.format(selected.value.time) : ''))
const authorText = computed(() => selected.value?.author ?? '')
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between gap-s-2">
      <p class="text-caption font-medium text-muted-foreground">{{ label }}</p>
      <p class="text-body font-semibold text-foreground">{{ valueText }}</p>
    </div>
    <p class="text-caption text-muted-foreground [overflow-wrap:anywhere]">
      {{ timeText }} {{ authorText }}
    </p>
    <svg
      class="h-auto w-full"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      role="img"
      :aria-label="label"
    >
      <g :transform="`translate(${MARGIN.left}, ${MARGIN.top})`">
        <g v-for="tick in yTicks" :key="`y${tick}`">
          <line
            x1="0"
            :x2="innerWidth"
            :y1="y(tick)"
            :y2="y(tick)"
            class="stroke-border"
            stroke-width="1"
          />
          <text
            x="-6"
            :y="y(tick)"
            text-anchor="end"
            dominant-baseline="middle"
            font-size="10"
            class="fill-muted-foreground"
          >
            {{ tick.toFixed(digits) }}
          </text>
        </g>
        <text
          v-for="tick in xTicks"
          :key="`x${tick.getTime()}`"
          :x="x(tick)"
          :y="innerHeight + 16"
          text-anchor="middle"
          font-size="10"
          class="fill-muted-foreground"
        >
          {{ dayFormat.format(tick) }}
        </text>
        <path
          :d="path"
          fill="none"
          class="stroke-primary"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <g v-for="point in points" :key="point.readingId">
          <circle
            :cx="x(point.time)"
            :cy="y(point.value)"
            r="3.5"
            stroke-width="1.5"
            class="stroke-primary"
            :class="selected?.readingId === point.readingId ? 'fill-primary' : 'fill-card'"
          />
          <circle
            :cx="x(point.time)"
            :cy="y(point.value)"
            r="12"
            class="cursor-pointer fill-transparent"
            @click="selectedId = point.readingId"
          />
        </g>
      </g>
    </svg>
  </div>
</template>