// The shape the dashboard charts take, whatever the source (the local readings, or the
// organization's readings from the backend). Points are oldest first, which is what a line needs.
export const METRICS = ['ph', 'temperatureC', 'salinityPpt', 'oxygenMgL'] as const
export type Metric = (typeof METRICS)[number]

export interface ChartPoint {
  time: Date // recordedAt
  value: number
  readingId: string
  author?: string // the organization view only
}

export interface MetricSeries {
  metric: Metric
  points: ChartPoint[]
}

export interface TankChartData {
  tankId: string
  from: Date
  to: Date
  series: MetricSeries[] // always the four metrics, in METRICS order
  latest: Partial<Record<Metric, ChartPoint>> // the newest point of each metric
}

// What a reading must have to be charted; the local `Reading` already has it.
export interface ChartReading {
  id: string
  tankId: string
  recordedAt: string
  ph: number
  temperatureC: number
  salinityPpt: number
  oxygenMgL: number
  author?: string
}

// `to` is exclusive. Readings of other tanks and outside the range are left out.
export function buildTankChartData(
  readings: readonly ChartReading[],
  tankId: string,
  from: Date,
  to: Date
): TankChartData {
  const inRange = readings
    .filter(reading => reading.tankId === tankId)
    .map(reading => ({ reading, time: new Date(reading.recordedAt) }))
    .filter(({ time }) => time >= from && time < to)
    .sort((a, b) => a.time.getTime() - b.time.getTime())

  const series: MetricSeries[] = METRICS.map(metric => ({
    metric,
    points: inRange.map(({ reading, time }) => ({
      time,
      value: reading[metric],
      readingId: reading.id,
      ...(reading.author ? { author: reading.author } : {}),
    })),
  }))

  const latest: Partial<Record<Metric, ChartPoint>> = {}
  for (const item of series) {
    const last = item.points[item.points.length - 1]
    if (last) latest[item.metric] = last
  }

  return { tankId, from, to, series, latest }
}