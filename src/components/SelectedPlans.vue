<template>
  <div class="mt-4">
    <v-chip-group>
      <v-chip
        v-for="plan in selectedPlans"
        :key="plan.name"
        :color="plan.visible ? 'primary' : 'grey'"
        :variant="plan.visible ? 'elevated' : 'outlined'"
        closable
        @click:close="removePlan(plan.name)"
        @click="toggleVisibility(plan.name)"
      >
        {{ plan.name }}
      </v-chip>
    </v-chip-group>
  </div>
</template>

<script setup lang="ts">
import type { PlanDefinition } from '../types'

const props = defineProps<{
  selectedPlans: (PlanDefinition & { visible: boolean })[]
}>()

const emit = defineEmits<{
  (e: 'toggle-visibility', planName: string): void
  (e: 'remove-plan', planName: string): void
}>()

const toggleVisibility = (planName: string) => {
  emit('toggle-visibility', planName)
}

const removePlan = (planName: string) => {
  emit('remove-plan', planName)
}
</script>
