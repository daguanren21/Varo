<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import type { AgentFineTuneControl } from './advanced-types'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    controls?: AgentFineTuneControl[]
    title?: string
  }>(),
  {
    controls: () => [],
    title: 'Fine tune'
  }
)

const emit = defineEmits<{
  apply: [controls: AgentFineTuneControl[]]
  'update:controls': [value: AgentFineTuneControl[]]
}>()

const rootClass = computed(() =>
  cn('agent-fine-tune overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className)
)
const inputTypes = computed(() =>
  props.controls.map((control) => control.type === 'number' ? 'number' : 'text')
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
      : control
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
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-[13px]">
      <text class="text-xs font-bold text-slate-800">{{ title }}</text>
      <text class="text-[9px] font-bold uppercase tracking-[.08em] text-slate-400">Adjust</text>
    </view>

    <view class="grid grid-cols-2 gap-2.5 p-3 max-[600px]:grid-cols-1">
      <label v-for="(control, index) in controls" :key="control.label" class="grid gap-1 text-[9px] font-semibold text-slate-500">
        <text>{{ control.label }}</text>
        <picker
          v-if="control.type === 'select'"
          class="box-border min-h-[38px] rounded-[9px] border border-slate-200 bg-white px-2.5 text-[11px] leading-[38px] text-slate-800"
          :range="control.values || []"
          range-key="label"
          :value="Math.max(0, (control.values || []).findIndex((item) => item.value === String(control.value)))"
          @change="selectValue(control, index, $event)"
        >
          {{ control.values?.find((item) => item.value === String(control.value))?.label || control.value }}
        </picker>
        <input
          v-else
          class="box-border min-h-[38px] w-full rounded-[9px] border border-slate-200 bg-white px-2.5 text-[11px] text-slate-800"
          :max="control.max"
          :min="control.min"
          :step="control.step"
          :type="inputTypes[index]"
          :value="String(control.value)"
          @input="update(index, eventValue($event))"
        />
      </label>
    </view>

    <view class="flex min-h-12 items-center justify-end border-t border-slate-100 px-3">
      <button class="min-h-[34px] rounded-[10px] border border-teal-700 bg-teal-700 px-3 text-[10px] font-bold text-white" type="button" @click="emit('apply', controls)">Apply changes</button>
    </view>
  </view>
</template>

<style scoped>
.agent-fine-tune button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
