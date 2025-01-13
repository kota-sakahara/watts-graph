<template>
  <v-card>
    <v-card-title>カスタムプラン作成</v-card-title>
    <v-card-text>
      <v-select
        :items="savedPlans"
        @update:model-value="selectSavedPlan"
        item-title="name"
        item-value="name"
        label="過去に作成したプランを呼び出す"
      ></v-select>
    </v-card-text>
    <v-card-text>
      <v-form @submit.prevent="addCustomPlan">
        <v-text-field v-model="customPlan.name" label="プラン名" required></v-text-field>
        <v-text-field
          v-model.number="customPlan.plan.basic"
          label="基本料金"
          type="number"
          required
        ></v-text-field>
        <v-text-field
          v-model.number="customPlan.plan.fuelAdjustment"
          label="燃料費調整額"
          type="number"
          suffix="円/kWh"
          required
        >
          <template #details>マイナスの場合はマイナスも含めて入力してください</template>
        </v-text-field>
        <v-row>
          <v-col cols="12">
            <v-table>
              <thead>
                <tr>
                  <th>段階</th>
                  <th>kWh単価</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(range, index) in customPlan.plan.usage" :key="index">
                  <td>{{ range.from }} ~ {{ range.to === Infinity ? '∞' : range.to }}</td>
                  <td>{{ range.price }}</td>
                </tr>
              </tbody>
            </v-table>
            <v-btn prepend-icon="mdi-minus" v-if="canPop" @click="popUsageRange" block size="small"
              >段階削除
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="mt-2" v-if="canPush">
          <v-col cols="4">
            <v-text-field
              v-model.number="nextFrom"
              type="number"
              suffix="kWh"
              density="compact"
              hide-details
              :disabled="true"
            ></v-text-field>
          </v-col>
          <v-col cols="1">
            <v-icon>mdi-arrow-right</v-icon>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model.number="inputRange.to"
              type="number"
              suffix="kWh"
              :disabled="inputRange.to === Infinity"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model.number="inputRange.price"
              type="number"
              suffix="円"
              required
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" class="my-0 py-0">
            <v-checkbox
              label="最終段階"
              type="number"
              density="compact"
              hide-details
              :model-value="inputRange.to === Infinity"
              @update:model-value="
                (val) => (val ? (inputRange.to = Infinity) : (inputRange.to = 0))
              "
            ></v-checkbox>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-btn
              prepend-icon="mdi-plus"
              :disabled="!canPush"
              @click="pushUsageRange"
              block
              size="small"
              >段階追加</v-btn
            >
          </v-col>
        </v-row>
        <v-btn type="submit" color="primary" class="mt-4" :disabled="!validPlan"
          >プランを追加</v-btn
        >
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PlanDefinition, UsageRange } from '../types'

const emit = defineEmits<{
  (e: 'add-custom-plan', plan: PlanDefinition): void
}>()

const props = defineProps<{
  savedPlans: PlanDefinition[]
}>()

const customPlan = ref<PlanDefinition>({
  name: '',
  plan: {
    basic: 0,
    fuelAdjustment: 0,
    usage: [],
  },
})
const initPlan = () => {
  customPlan.value = {
    name: '',
    plan: {
      basic: 0,
      fuelAdjustment: 0,
      usage: [],
    },
  }
}

const inputRange = ref<{ to: number; price: number }>({ to: 0, price: 0 })

const pushUsageRange = () => {
  // last rangeのtoを取得
  const lastRange = customPlan.value.plan.usage[customPlan.value.plan.usage.length - 1]
  customPlan.value.plan.usage.push({
    from: lastRange?.to ?? 0,
    to: inputRange.value.to,
    price: inputRange.value.price,
  })
}
const popUsageRange = () => {
  if (customPlan.value.plan.usage.length > 0) {
    customPlan.value.plan.usage.pop()
  }
}

const canPop = computed(() => {
  return customPlan.value.plan.usage.length > 0
})
const canPush = computed(() => {
  return (
    customPlan.value.plan.usage.length === 0 ||
    customPlan.value.plan.usage[customPlan.value.plan.usage.length - 1].to !== Infinity
  )
})
const validPlan = computed(() => {
  return (
    customPlan.value.name !== '' &&
    customPlan.value.plan.usage.length > 0 &&
    customPlan.value.plan.usage[customPlan.value.plan.usage.length - 1]?.to === Infinity
  )
})

const nextFrom = computed(() => {
  return customPlan.value.plan.usage[customPlan.value.plan.usage.length - 1]?.to ?? 0
})

const addCustomPlan = () => {
  if (validPlan.value) {
    const planDefinition = JSON.parse(JSON.stringify(customPlan.value))
    planDefinition.plan.usage = planDefinition.plan.usage.map((u: UsageRange) => {
      return {
        from: u.from,
        to: u.to === null ? Infinity : u.to,
        price: u.price,
      }
    })
    emit('add-custom-plan', planDefinition)
    initPlan()
  }
}

const selectSavedPlan = (planName: string) => {
  const plan = props.savedPlans.find((p) => p.name === planName)
  if (plan) {
    customPlan.value = plan
  }
}
</script>
