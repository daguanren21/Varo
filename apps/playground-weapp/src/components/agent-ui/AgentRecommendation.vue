<script setup lang="ts">
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VProgress from '../ui/v-progress.vue'
import type { AgentAlternative } from './types'

const props = withDefaults(
  defineProps<{
    acceptText?: string
    alternatives?: AgentAlternative[]
    confidence?: number
    description?: string
    title: string
  }>(),
  {
    acceptText: '接受建议',
    alternatives: () => [],
    confidence: 0,
    description: ''
  }
)

const emit = defineEmits<{
  accept: []
  selectAlternative: [alternative: AgentAlternative]
}>()

const confidence = computed(() => Math.min(100, Math.max(0, props.confidence)))
const confidenceLabel = computed(() => (confidence.value >= 80 ? '高置信度' : confidence.value >= 55 ? '中等置信度' : '需要复核'))
</script>

<template>
  <VCard class="agent-recommendation" :padding="false" variant="outline">
    <view class="grid gap-3 rounded-2xl bg-[linear-gradient(145deg,#fff_0%,#eff6ff_100%)] p-[15px] shadow-[0_8px_24px_rgba(30,64,175,.08)]">
    <view class="flex items-center justify-between gap-3">
      <text class="text-[10px] font-extrabold tracking-[.12em] text-blue-700">Agent 建议</text>
      <text class="text-[10px] tabular-nums text-slate-500">{{ confidenceLabel }} · {{ confidence }}%</text>
    </view>
    <text class="text-[15px] font-extrabold leading-[1.45] text-slate-950">{{ title }}</text>
    <text v-if="description" class="text-xs leading-[1.55] text-slate-600">{{ description }}</text>
    <VProgress :percentage="confidence" :show-text="false" :stroke-width="5" status="active" />

    <view v-if="alternatives.length" class="grid gap-1.5 pt-1">
      <text class="text-[10px] font-bold text-slate-400">其他选项</text>
      <button
        v-for="alternative in alternatives"
        :key="alternative.value"
        class="flex min-h-[46px] items-center justify-between gap-2.5 rounded-[10px] border border-blue-100 bg-white/80 px-2.5 py-2 text-left text-blue-900"
        type="button"
        @click="emit('selectAlternative', alternative)"
      >
        <view class="grid gap-0.5">
          <text class="text-[11px] font-bold">{{ alternative.label }}</text>
          <text v-if="alternative.description" class="text-[10px] text-slate-500">{{ alternative.description }}</text>
        </view>
        <text aria-hidden="true">›</text>
      </button>
    </view>

    <view class="flex justify-end gap-2 pt-1">
      <slot name="secondary" />
      <VButton @click="emit('accept')">{{ acceptText }}</VButton>
    </view>
    </view>
  </VCard>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
