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

const rootClass = computed(() => cn('agent-fine-tune', props.className))
const countLabel = computed(() => `${props.controls.length} 项`)
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
          'agent-native-button agent-fine-tune__choice',
          selected && 'is-selected',
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
    <view class="agent-fine-tune__header">
      <view class="agent-fine-tune__heading">
        <text class="agent-fine-tune__title">
          {{ title }}
        </text>
        <text class="agent-fine-tune__hint">
          调整生成参数后立即生效
        </text>
      </view>
      <text class="agent-fine-tune__count">
        {{ countLabel }}
      </text>
    </view>

    <view class="agent-fine-tune__grid">
      <view v-for="field in fields" :key="field.control.label" class="agent-fine-tune__field">
        <text class="agent-fine-tune__label">
          {{ field.control.label }}
        </text>
        <view
          v-if="field.control.type === 'select'"
          class="agent-fine-tune__choices"
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
            <text v-if="option.selected" class="agent-fine-tune__choice-check" aria-hidden="true">
              ✓
            </text>
          </button>
        </view>
        <input
          v-else
          class="agent-fine-tune__input"
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

    <view class="agent-fine-tune__footer">
      <button class="agent-native-button agent-fine-tune__apply" type="button" @click="emit('apply', controls)">
        Apply changes
      </button>
    </view>
  </view>
</template>

<style>
.agent-fine-tune {
  overflow: hidden;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-fine-tune__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 52px;
  padding: 12px 14px 11px;
  border-bottom: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-fine-tune__heading {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.agent-fine-tune__title {
  font-size: 13px;
  font-weight: 760;
  line-height: 18px;
  color: var(--varo-agent-foreground, #172033);
}

.agent-fine-tune__hint,
.agent-fine-tune__count,
.agent-fine-tune__label {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-fine-tune__count {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.agent-fine-tune__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px;
}

.agent-fine-tune__field {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.agent-fine-tune__input {
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 0 10px;
  font-size: 12px;
  color: var(--varo-agent-foreground, #172033);
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 10px;
}

.agent-fine-tune__choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.agent-fine-tune__choice {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 11px;
  font-size: 12px;
  font-weight: 650;
  color: var(--varo-agent-text, #475569);
  text-align: left;
  background: var(--varo-agent-surface-strong, #f8fafc);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 10px;
}

.agent-fine-tune__choice.is-selected {
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-color: var(--varo-agent-primary, #0f766e);
}

.agent-fine-tune__choice-check {
  font-size: 12px;
  font-weight: 850;
}

.agent-fine-tune__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 48px;
  padding: 0 12px;
  border-top: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-fine-tune__apply {
  min-height: 34px;
  padding: 0 11px;
  font-size: 11px;
  font-weight: 750;
  color: var(--varo-agent-primary-foreground, #fff);
  background: var(--varo-agent-primary, #0f766e);
  border: 1px solid var(--varo-agent-primary, #0f766e);
  border-radius: 10px;
}

@media (max-width: 600px) {
  .agent-fine-tune__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
