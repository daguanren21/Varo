<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentSelectionAction } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    actions?: AgentSelectionAction[]
    className?: ClassValue
    text: string
  }>(),
  {
    actions: () => [],
  },
)

const emit = defineEmits<{
  select: [payload: { action: AgentSelectionAction, text: string }]
}>()

const rootClass = computed(() =>
  cn('agent-selection-actions overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className),
)
</script>

<template>
  <view :class="rootClass">
    <view class="border-b border-slate-100 bg-slate-50 px-3.5 py-3">
      <text class="block border-l-[3px] border-teal-600 pl-3 text-[12px] leading-5 text-slate-600">
        {{ text }}
      </text>
    </view>
    <view class="flex flex-wrap gap-2 p-2.5">
      <button v-for="action in actions" :key="action.id" class="min-h-8 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600" hover-class="border-teal-300 text-teal-700" :hover-start-time="20" :hover-stay-time="70" type="button" @click="emit('select', { action, text })">
        {{ action.label }}
      </button>
    </view>
  </view>
</template>

<style scoped>
.agent-selection-actions button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
