<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <h1 class="text-h4 mb-4">電気料金プラン比較</h1>
        <v-row>
          <v-col cols="12" md="8">
            <chart :plans="visiblePlans" />
            <selected-plans
              :selected-plans="selectedPlans"
              @toggle-visibility="togglePlanVisibility"
              @remove-plan="removePlan"
            />
          </v-col>
          <v-col cols="12" md="4">
            <custom-plan-input :saved-plans="customPlans" @add-custom-plan="addCustomPlan" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Chart from './components/Chart.vue'
import CustomPlanInput from './components/CustomPlanInput.vue'
import SelectedPlans from './components/SelectedPlans.vue'
import type { Supplier, PlanDefinition, UsageRange } from './types'

const suppliers = ref<Supplier[]>([])
const selectedPlans = ref<(PlanDefinition & { visible: boolean })[]>([])
const customPlans = ref<PlanDefinition[]>([])

const visiblePlans = computed(() => selectedPlans.value.filter((plan) => plan.visible))

onMounted(async () => {
  // Load suppliers data (mock data for now)
  suppliers.value = [
    {
      name: '電力会社A',
      plans: [
        {
          name: 'プランA1',
          plan: {
            basic: 1000,
            fuelAdjustment: 0,
            usage: [
              { from: 0, to: 120, price: 20 },
              { from: 120, to: 300, price: 25 },
              { from: 300, to: Infinity, price: 30 },
            ],
          },
        },
        {
          name: 'プランA2',
          plan: {
            basic: 1200,
            fuelAdjustment: 0,
            usage: [
              { from: 0, to: 120, price: 19 },
              { from: 120, to: 300, price: 23 },
              { from: 300, to: Infinity, price: 27 },
            ],
          },
        },
      ],
    },
    {
      name: '電力会社B',
      plans: [
        {
          name: 'プランB1',
          plan: {
            basic: 850,
            fuelAdjustment: 0,
            usage: [
              { from: 0, to: 100, price: 22 },
              { from: 100, to: 250, price: 27 },
              { from: 250, to: Infinity, price: 32 },
            ],
          },
        },
      ],
    },
  ]

  // Load custom plans from localStorage
  const storedCustomPlans = localStorage.getItem('customPlans')
  if (storedCustomPlans) {
    const plans = JSON.parse(storedCustomPlans)
    plans.map((p: PlanDefinition) => {
      p.plan.usage = p.plan.usage.map((u: UsageRange) => {
        return {
          from: u.from,
          to: u.to === null ? Infinity : u.to,
          price: u.price,
        }
      })
    })
    customPlans.value = plans
  }
})

const addPlan = (plan: PlanDefinition) => {
  if (!selectedPlans.value.some((p) => p.name === plan.name)) {
    selectedPlans.value.push({ ...plan, visible: true })
  }
}

const addCustomPlan = (plan: PlanDefinition) => {
  customPlans.value.push(plan)
  localStorage.setItem('customPlans', JSON.stringify(customPlans.value))
  addPlan(plan)
}

const togglePlanVisibility = (planName: string) => {
  const plan = selectedPlans.value.find((p) => p.name === planName)
  if (plan) {
    plan.visible = !plan.visible
  }
}

const removePlan = (planName: string) => {
  selectedPlans.value = selectedPlans.value.filter((p) => p.name !== planName)
}
</script>
