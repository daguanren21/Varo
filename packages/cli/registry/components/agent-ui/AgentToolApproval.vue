<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentCheckIcon, agentShieldAlertIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    description?: string
    details?: Array<{ label: string, value: string }>
    remember?: boolean
    tool: string
  }>(),
  {
    description: '',
    details: () => [],
    remember: false,
  },
)

const emit = defineEmits<{
  'allow': [options: { remember: boolean }]
  'deny': []
  'update:remember': [value: boolean]
}>()

const rootClass = computed(() =>
  cn('agent-tool-approval overflow-hidden rounded-2xl border border-[var(--varo-agent-warning)] bg-[var(--varo-agent-warning-soft)] shadow-sm', props.className),
)
const approvalLabel = computed(() => `Approve ${props.tool}`)
const rememberBoxClass = computed(() => cn(
  'grid h-4 w-4 place-items-center rounded border',
  props.remember
    ? 'border-[var(--varo-agent-success)] bg-[var(--varo-agent-success-soft)]'
    : 'border-[var(--varo-agent-border-strong)] bg-[var(--varo-agent-surface)]',
))
</script>

<template>
  <view :class="rootClass" role="group" :aria-label="approvalLabel">
    <view class="flex items-start gap-3 p-3.5">
      <view class="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[var(--varo-agent-warning-soft)]" aria-hidden="true">
        <image class="h-5 w-5" :src="agentShieldAlertIcon" mode="aspectFit" />
      </view>
      <view class="grid min-w-0 flex-1 gap-0.5">
        <text class="text-[10px] font-bold uppercase tracking-[.1em] text-[var(--varo-agent-warning)]">
          Tool permission
        </text>
        <text class="truncate text-[13px] font-bold text-[var(--varo-agent-foreground)]">
          {{ tool }}
        </text>
        <text v-if="description" class="mt-1 text-[12px] leading-4 text-[var(--varo-agent-text)]">
          {{ description }}
        </text>
      </view>
    </view>

    <view v-if="details.length" class="mx-3.5 mb-2.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-2.5 text-[11px]">
      <template v-for="detail in details" :key="detail.label">
        <text class="text-[var(--varo-agent-muted)]">
          {{ detail.label }}
        </text>
        <text class="truncate text-right font-semibold text-[var(--varo-agent-foreground)]">
          {{ detail.value }}
        </text>
      </template>
    </view>

    <button class="mx-3.5 mb-3 inline-flex min-h-9 items-center gap-2 border-0 bg-transparent p-0 text-[11px] text-[var(--varo-agent-text)]" type="button" role="checkbox" :aria-checked="remember" @click="emit('update:remember', !remember)">
      <text :class="rememberBoxClass" aria-hidden="true">
        <image v-if="remember" class="h-3 w-3" :src="agentCheckIcon" mode="aspectFit" />
      </text>
      Remember this permission
    </button>

    <view class="agent-tool-approval__actions flex min-h-12 items-center justify-end gap-2 border-t border-[var(--varo-agent-border)] px-3">
      <button class="min-h-9 rounded-[10px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-3 text-[11px] font-bold text-[var(--varo-agent-text)]" type="button" @click="emit('deny')">
        Deny
      </button>
      <button class="min-h-9 rounded-[10px] border border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary)] px-3 text-[11px] font-bold text-white" type="button" @click="emit('allow', { remember })">
        Allow once
      </button>
    </view>
  </view>
</template>

<style scoped>
.agent-tool-approval button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
