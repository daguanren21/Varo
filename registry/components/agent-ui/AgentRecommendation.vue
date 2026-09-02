<script setup lang="ts">
import type { AgentAlternative } from './types'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import VCard from '../ui/v-card.vue'
import VProgress from '../ui/v-progress.vue'

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
    description: '',
  },
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
    <view class="grid gap-3 rounded-2xl bg-[var(--varo-agent-surface)] p-[15px] shadow-[var(--varo-agent-shadow)]">
      <view class="flex items-center justify-between gap-3">
        <text class="text-[11px] font-extrabold tracking-[.12em] text-[var(--varo-agent-primary)]">
          Agent 建议
        </text>
        <text class="text-[11px] tabular-nums text-[var(--varo-agent-text)]">
          {{ confidenceLabel }} · {{ confidence }}%
        </text>
      </view>
      <text class="text-[15px] font-extrabold leading-[1.45] text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text v-if="description" class="text-xs leading-[1.55] text-[var(--varo-agent-text)]">
        {{ description }}
      </text>
      <VProgress :percentage="confidence" :show-text="false" :stroke-width="5" status="active" />

      <view v-if="alternatives.length" class="grid gap-1.5 pt-1">
        <text class="text-[11px] font-bold text-[var(--varo-agent-muted)]">
          其他选项
        </text>
        <button
          v-for="alternative in alternatives"
          :key="alternative.value"
          class="flex min-h-[46px] items-center justify-between gap-2.5 rounded-[10px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-2.5 py-2 text-left text-[var(--varo-agent-foreground)]"
          type="button"
          @click="emit('selectAlternative', alternative)"
        >
          <view class="grid gap-0.5">
            <text class="text-[12px] font-bold">
              {{ alternative.label }}
            </text>
            <text v-if="alternative.description" class="text-[11px] text-[var(--varo-agent-text)]">
              {{ alternative.description }}
            </text>
          </view>
          <text aria-hidden="true">
            ›
          </text>
        </button>
      </view>

      <view class="flex justify-end gap-2 pt-1">
        <slot name="secondary" />
        <VButton @click="emit('accept')">
          {{ acceptText }}
        </VButton>
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
