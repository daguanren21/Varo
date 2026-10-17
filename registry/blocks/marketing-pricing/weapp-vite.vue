<script setup lang="ts">
import type { MarketingPricingChoice, MarketingPricingFeature, MarketingPricingPeriod, MarketingPricingPlan } from './marketing-pricing.types'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'

defineOptions({
  properties: {
    plans: { type: Array, value: [] },
    features: { type: Array, value: [] },
    periods: { type: Array, value: [] },
  },
})

const props = withDefaults(defineProps<{
  plans: MarketingPricingPlan[]
  features: MarketingPricingFeature[]
  periods: MarketingPricingPeriod[]
  periodId: string
  selectedPlanId: string
  title?: string
  loading?: boolean
  error?: string
  pending?: boolean
  disabled?: boolean
}>(), { plans: () => [], features: () => [], periods: () => [], periodId: '', selectedPlanId: '', title: 'Compare your options', loading: false, error: '', pending: false, disabled: false })
const emit = defineEmits<{ periodChange: [id: string], choose: [choice: MarketingPricingChoice] }>()
const blocked = computed(() => props.loading || !!props.error || props.pending || props.disabled)
const activePeriod = computed(() => props.periods.find(period => period.id === props.periodId))
const periodRows = computed(() => props.periods.map(period => ({
  ...period,
  selected: period.id === props.periodId,
  blocked: blocked.value || !!period.disabled || period.id === props.periodId,
})))
const rows = computed(() => props.plans.map(plan => ({
  ...plan,
  price: plan.prices[props.periodId] || 'Not offered for this period',
  selected: plan.id === props.selectedPlanId,
  chooseLabel: `Choose ${plan.name}`,
  blocked: blocked.value || !activePeriod.value || !!activePeriod.value.disabled || !plan.canChoose || !!plan.disabled || !plan.prices[props.periodId] || plan.id === props.selectedPlanId,
  comparison: props.features.map(feature => ({ ...feature, value: plan.features[feature.id] ?? 'Not specified' })),
})))
function changePeriod(id: string) {
  const period = props.periods.find(item => item.id === id)
  if (blocked.value || !period || period.disabled || id === props.periodId) { return }
  emit('periodChange', id)
}
function choose(id: string) {
  const plan = props.plans.find(item => item.id === id)
  if (blocked.value || !activePeriod.value || activePeriod.value.disabled || !plan?.canChoose || plan.disabled || !plan.prices[props.periodId] || id === props.selectedPlanId) { return }
  emit('choose', { planId: id, periodId: props.periodId })
}
</script>

<template>
  <view class="grid min-w-0 gap-4 break-words" :aria-label="title">
    <text class="text-xl font-semibold">
      {{ title }}
    </text>
    <text v-if="loading" role="status">
      Loading plans…
    </text>
    <text v-if="pending" role="status">
      Awaiting application decision. No charge has been made.
    </text>
    <text v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </text>
    <view class="flex flex-wrap gap-2" aria-label="Pricing period">
      <VButton v-for="period in periodRows" :key="period.id" class-name="h-auto min-h-11 max-w-full whitespace-normal break-words" variant="outline" :aria-pressed="period.selected" :disabled="period.blocked" @click="changePeriod(period.id)">
        {{ period.label }}
      </VButton>
    </view>
    <text v-if="!plans.length && !loading && !error" role="status">
      No plans available.
    </text>
    <view v-for="plan in rows" :key="plan.id" class="grid min-w-0 gap-3 rounded-lg border border-[var(--varo-ui-border)] p-4" :data-plan="plan.id">
      <text class="text-lg font-semibold">
        {{ plan.name }}
      </text>
      <text class="whitespace-pre-wrap text-sm">
        {{ plan.description }}
      </text>
      <text class="text-2xl font-semibold">
        {{ plan.price }}
      </text>
      <text v-if="plan.selected" role="status">
        Selected
      </text>
      <view class="grid gap-2">
        <view v-for="feature in plan.comparison" :key="feature.id" class="grid gap-1 border-t border-[var(--varo-ui-border)] pt-2">
          <text class="text-sm font-medium">
            {{ feature.label }}
          </text>
          <text class="whitespace-pre-wrap text-sm text-[var(--varo-ui-text-regular)]">
            {{ feature.value }}
          </text>
        </view>
      </view>
      <VButton :disabled="plan.blocked" :aria-label="plan.chooseLabel" @click="choose(plan.id)">
        Choose plan
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
