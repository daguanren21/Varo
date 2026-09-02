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
const fields = computed(() =>
  props.controls.map((control, index) => ({
    control,
    index,
    inputType: control.type === 'number' ? 'number' : 'text',
    options: (control.values ?? []).map((option) => {
      const selected = option.value === String(control.value)
      return {
        ...option,
        ariaChecked: selected,
        className: cn(
          'flex min-h-10 items-center justify-between gap-2 rounded-[10px] border px-2.5 text-left text-[12px] font-semibold',
          selected
            ? 'border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary-soft)] text-[var(--varo-agent-primary)]'
            : 'border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] text-[var(--varo-agent-text)]',
        ),
        selected,
      }
    }),
  })),
)

function eventValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
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
      <view v-for="field in fields" :key="field.control.label" class="grid gap-1.5 text-[10px] font-semibold text-[var(--varo-agent-text)]">
        <text>{{ field.control.label }}</text>
        <view
          v-if="field.control.type === 'select'"
          class="grid grid-cols-2 gap-1.5"
          role="radiogroup"
          :aria-label="field.control.label"
        >
          <button
            v-for="option in field.options"
            :key="option.value"
            :class="option.className"
            role="radio"
            :aria-checked="option.ariaChecked"
            hover-class="bg-[var(--varo-agent-fill)]"
            :hover-start-time="20"
            :hover-stay-time="70"
            type="button"
            @click="update(field.index, option.value)"
          >
            <text>{{ option.label }}</text>
            <text v-if="option.selected" class="text-[12px] font-black" aria-hidden="true">
              ✓
            </text>
          </button>
        </view>
        <input
          v-else
          class="box-border min-h-10 w-full rounded-[10px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-2.5 text-[12px] text-[var(--varo-agent-foreground)]"
          :aria-label="field.control.label"
          :max="field.control.max"
          :min="field.control.min"
          :step="field.control.step"
          :type="field.inputType"
          :value="String(field.control.value)"
          @input="update(field.index, eventValue($event))"
        >
      </view>
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
