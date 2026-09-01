<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentFineTuneControl } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    controls?: AgentFineTuneControl[]
    title?: string
  }>(),
  {
    controls: () => [],
    title: 'Fine tune',
  },
)

const emit = defineEmits<{
  'apply': [controls: AgentFineTuneControl[]]
  'update:controls': [value: AgentFineTuneControl[]]
}>()

const rootClass = computed(() =>
  cn('agent-fine-tune overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm', props.className),
)
const inputTypes = computed(() =>
  props.controls.map(control => control.type === 'number' ? 'number' : 'text'),
)

function eventValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | HTMLSelectElement | null
  return miniEvent.detail?.value ?? target?.value ?? ''
}

function update(index: number, value: string) {
  const controls = props.controls.map((control, controlIndex) =>
    controlIndex === index
      ? { ...control, value: control.type === 'number' ? Number(value) : value }
      : control,
  )
  emit('update:controls', controls)
}

function selectValue(control: AgentFineTuneControl, index: number, event: Event) {
  const option = control.values?.[Number(eventValue(event))]
  update(index, option?.value ?? '')
}
</script>

<template>
  <view :class="rootClass">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] px-[13px]">
      <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text class="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--varo-agent-muted)]">
        Adjust
      </text>
    </view>

    <view class="grid grid-cols-2 gap-2.5 p-3 max-[600px]:grid-cols-1">
      <label v-for="(control, index) in controls" :key="control.label" class="grid gap-1 text-[10px] font-semibold text-[var(--varo-agent-text)]">
        <text>{{ control.label }}</text>
        <picker
          v-if="control.type === 'select'"
          class="box-border min-h-[38px] rounded-[9px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-2.5 text-[12px] leading-[38px] text-[var(--varo-agent-foreground)]"
          :range="control.values || []"
          range-key="label"
          :value="Math.max(0, (control.values || []).findIndex((item) => item.value === String(control.value)))"
          @change="selectValue(control, index, $event)"
        >
          {{ control.values?.find((item) => item.value === String(control.value))?.label || control.value }}
        </picker>
        <input
          v-else
          class="box-border min-h-[38px] w-full rounded-[9px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-2.5 text-[12px] text-[var(--varo-agent-foreground)]"
          :max="control.max"
          :min="control.min"
          :step="control.step"
          :type="inputTypes[index]"
          :value="String(control.value)"
          @input="update(index, eventValue($event))"
        >
      </label>
    </view>

    <view class="flex min-h-12 items-center justify-end border-t border-[var(--varo-agent-border)] px-3">
      <button class="min-h-9 rounded-[10px] border border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary)] px-3 text-[11px] font-bold text-white" type="button" @click="emit('apply', controls)">
        Apply changes
      </button>
    </view>
  </view>
</template>

<style scoped>
.agent-fine-tune button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
