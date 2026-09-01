<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentSearchItem } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentSearchIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    emptyText?: string
    items?: AgentSearchItem[]
    modelValue?: string
    placeholder?: string
  }>(),
  {
    emptyText: 'No commands found',
    items: () => [],
    modelValue: '',
    placeholder: 'Search commands…',
  },
)

const emit = defineEmits<{
  'select': [item: AgentSearchItem]
  'update:modelValue': [value: string]
}>()

const rootClass = computed(() =>
  cn('agent-command-search overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-xl', props.className),
)
const visibleItems = computed(() => {
  const query = props.modelValue.trim().toLowerCase()
  return query
    ? props.items.filter(item => `${item.label} ${item.description ?? ''} ${item.group ?? ''}`.toLowerCase().includes(query))
    : props.items
})

function inputValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  emit('update:modelValue', miniEvent.detail?.value ?? target?.value ?? '')
}
</script>

<template>
  <view :class="rootClass">
    <view class="flex min-h-[50px] items-center gap-2.5 border-b border-[var(--varo-agent-border)] px-[13px]">
      <image class="h-[18px] w-[18px] flex-none" :src="agentSearchIcon" mode="aspectFit" aria-hidden="true" />
      <input class="min-w-0 flex-1 border-0 bg-transparent text-[12px] text-[var(--varo-agent-foreground)] outline-none" :value="modelValue" :placeholder="placeholder" @input="inputValue">
    </view>

    <scroll-view v-if="visibleItems.length" class="max-h-[280px] p-2" scroll-y :show-scrollbar="false">
      <button v-for="item in visibleItems" :key="item.id" class="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border-0 bg-[var(--varo-agent-surface)] px-2.5 py-2 text-left" hover-class="bg-[var(--varo-agent-surface-strong)]" :hover-start-time="20" :hover-stay-time="70" type="button" @click="emit('select', item)">
        <view class="grid min-w-0 flex-1 gap-0.5">
          <text class="truncate text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
            {{ item.label }}
          </text>
          <text v-if="item.description" class="truncate text-[11px] text-[var(--varo-agent-muted)]">
            {{ item.description }}
          </text>
        </view>
        <text v-if="item.shortcut" class="rounded-md border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-1.5 py-1 font-mono text-[10px] text-[var(--varo-agent-muted)]">
          {{ item.shortcut }}
        </text>
      </button>
    </scroll-view>
    <view v-else class="grid min-h-24 place-items-center text-[12px] text-[var(--varo-agent-muted)]">
      {{ emptyText }}
    </view>
  </view>
</template>

<style scoped>
.agent-command-search button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
