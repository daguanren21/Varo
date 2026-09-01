<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentCitationItem } from './advanced-types'
import { computed, shallowRef } from 'wevu'
import { cn } from '../../lib/cn'
import { agentChevronDownIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    defaultOpen?: boolean
    items?: AgentCitationItem[]
    title?: string
  }>(),
  {
    defaultOpen: false,
    items: () => [],
    title: 'Sources',
  },
)

const emit = defineEmits<{
  'open': [item: AgentCitationItem]
  'update:open': [value: boolean]
}>()

const open = shallowRef(props.defaultOpen)
const rootClass = computed(() =>
  cn('agent-citations overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm', props.className),
)

function toggle() {
  open.value = !open.value
  emit('update:open', open.value)
}
</script>

<template>
  <view :class="rootClass" :data-open="String(open)">
    <button class="flex min-h-12 w-full items-center justify-between gap-3 border-0 bg-[var(--varo-agent-surface)] px-[13px] text-left" type="button" :aria-expanded="open" @click="toggle">
      <view class="flex min-w-0 items-center gap-2">
        <text class="truncate text-xs font-bold text-[var(--varo-agent-foreground)]">
          {{ title }}
        </text>
        <text class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--varo-agent-fill)] px-1 text-[10px] leading-none tabular-nums text-[var(--varo-agent-text)]">
          {{ items.length }}
        </text>
      </view>
      <image class="h-4 w-4 transition-transform" :class="[open && 'rotate-180']" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
    </button>

    <view v-if="open" class="grid gap-1 border-t border-[var(--varo-agent-border)] p-2">
      <button v-for="(item, index) in items" :key="item.id" class="flex min-h-11 w-full items-center gap-2.5 rounded-xl border-0 bg-[var(--varo-agent-surface-strong)] px-2.5 py-2 text-left" hover-class="bg-[var(--varo-agent-fill)]" :hover-start-time="20" :hover-stay-time="70" type="button" @click="emit('open', item)">
        <text class="grid h-6 w-6 flex-none place-items-center rounded-lg bg-[var(--varo-agent-surface)] text-[10px] font-bold tabular-nums text-[var(--varo-agent-primary)] shadow-sm">
          {{ index + 1 }}
        </text>
        <view class="grid min-w-0 flex-1 gap-0.5">
          <text class="truncate text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
            {{ item.title }}
          </text>
          <text class="truncate text-[11px] text-[var(--varo-agent-muted)]">
            {{ item.domain || item.description || item.url }}
          </text>
        </view>
      </button>
    </view>
  </view>
</template>

<style scoped>
.agent-citations button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
