<template>
  <v-card>
    <v-card-title>電気料金プラン比較グラフ</v-card-title>
    <v-card-text>
      <canvas ref="chartRef"></canvas>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { PlanDefinition } from '../types'

const props = defineProps<{
  plans: PlanDefinition[]
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const createChart = () => {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  const datasets = props.plans.map((plan) => ({
    label: plan.name,
    data: generateDataPoints(plan.plan),
    fill: false,
  }))

  chart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: '使用量 (kWh)' },
        },
        y: {
          type: 'linear',
          title: { display: true, text: '料金 (円)' },
        },
      },
    },
  })
}

const generateDataPoints = (plan: PlanDefinition['plan']) => {
  const fromX = plan.usage.map((u) => u.from)

  const meshX = []
  for (let usage = 0; usage <= 500; usage += 50) {
    console.log(`--- usage: ${usage} ---`)
    meshX.push(usage)
  }

  const distinct = new Set([...fromX, ...meshX])
  const sorted = Array.from(distinct).sort((a, b) => a - b)

  const points = sorted.map((x) => {
    return {
      x,
      y: calculateTotalPrice(plan, x),
    }
  })

  return points
}

const calculateTotalPrice = (plan: PlanDefinition['plan'], usage: number) => {
  let total = plan.basic
  let usageBudget = usage
  for (const range of plan.usage) {
    const rangeUsage = Math.min(
      usageBudget,
      range.to === Infinity ? usageBudget : range.to - range.from,
    )

    const adjustedPrice = range.price + (plan.fuelAdjustment ?? 0)
    total += rangeUsage * adjustedPrice
    usageBudget -= rangeUsage
  }
  return total
}

onMounted(() => {
  createChart()
})

watch(
  () => props.plans,
  () => {
    if (chart) {
      chart.destroy()
    }
    createChart()
  },
  { deep: true },
)
</script>
